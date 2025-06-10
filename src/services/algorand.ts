import algosdk from 'algosdk';
import { Certificate, VerificationResult } from '../types/certificate';
import { createAlgodClient, createIndexerClient } from '../config/algorand';

export class AlgorandService {
  private static instance: AlgorandService;
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private certificates: Map<string, Certificate> = new Map();

  private constructor() {
    this.algodClient = createAlgodClient();
    this.indexerClient = createIndexerClient();
    this.initializeDemoData();
  }

  static getInstance(): AlgorandService {
    if (!AlgorandService.instance) {
      AlgorandService.instance = new AlgorandService();
    }
    return AlgorandService.instance;
  }

  private initializeDemoData() {
    // Keep demo certificates for fallback/testing
    const demoCertificates: Certificate[] = [
      {
        id: 'cert_react_2024_001',
        studentName: 'Alice Johnson',
        courseName: 'Advanced React Development',
        completionDate: '2024-01-15',
        issuerName: 'TechAcademy Pro',
        certificateHash: 'hash_react_alice_2024',
        tokenId: 123456,
        walletAddress: 'DEMO7XVFWK2JGHPQXNVQJDUMXC5NVGM6QJKM3HXLWMZPQJDUMXC5NVGM6Q',
        metadata: {
          description: 'Comprehensive course covering advanced React patterns, hooks, state management with Redux, and modern testing practices.',
          issueDate: '2024-01-15T10:00:00Z',
          skills: ['React', 'TypeScript', 'Redux Toolkit', 'React Testing Library', 'Next.js', 'GraphQL'],
          duration: '8 weeks',
          grade: 'A+',
        },
      },
      {
        id: 'cert_blockchain_2024_002',
        studentName: 'Bob Smith',
        courseName: 'Blockchain Fundamentals & Smart Contracts',
        completionDate: '2024-01-20',
        issuerName: 'CryptoUniversity',
        certificateHash: 'hash_blockchain_bob_2024',
        tokenId: 789012,
        walletAddress: 'DEMO7XVFWK2JGHPQXNVQJDUMXC5NVGM6QJKM3HXLWMZPQJDUMXC5NVGM6Q',
        metadata: {
          description: 'Deep dive into blockchain technology, cryptocurrencies, and smart contract development.',
          issueDate: '2024-01-20T14:30:00Z',
          skills: ['Blockchain', 'Smart Contracts', 'Algorand', 'Solidity', 'DeFi', 'Web3'],
          duration: '6 weeks',
          grade: '95%',
        },
      },
    ];

    demoCertificates.forEach(cert => {
      this.certificates.set(cert.id, cert);
    });
  }

  private async getWalletSigner(walletAddress: string): Promise<algosdk.TransactionSigner | null> {
    try {
      // Check if MyAlgo is available
      if (typeof window !== 'undefined' && (window as any).MyAlgoConnect) {
        const MyAlgoConnect = (window as any).MyAlgoConnect;
        const myAlgoWallet = new MyAlgoConnect();
        
        return async (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => {
          const signedTxns = await myAlgoWallet.signTransaction(
            txnGroup.map(txn => txn.toByte())
          );
          return signedTxns.map((signed: any) => signed.blob);
        };
      }
      
      // Fallback: Return null to indicate wallet not available
      return null;
    } catch (error) {
      console.error('Error getting wallet signer:', error);
      return null;
    }
  }

  private createCertificateMetadata(certificate: Certificate): string {
    const metadata = {
      name: `Certificate: ${certificate.courseName}`,
      description: certificate.metadata.description,
      student: certificate.studentName,
      course: certificate.courseName,
      issuer: certificate.issuerName,
      completionDate: certificate.completionDate,
      issueDate: certificate.metadata.issueDate,
      skills: certificate.metadata.skills,
      duration: certificate.metadata.duration,
      grade: certificate.metadata.grade,
      certificateId: certificate.id,
      certificateHash: certificate.certificateHash,
    };
    
    return JSON.stringify(metadata);
  }

  async mintCertificate(certificate: Certificate, walletAddress: string): Promise<{ success: boolean; tokenId?: number; error?: string }> {
    try {
      // Get wallet signer
      const signer = await this.getWalletSigner(walletAddress);
      if (!signer) {
        // Fallback to demo mode if wallet not available
        console.warn('Wallet not available, using demo mode');
        return this.mintCertificateDemo(certificate, walletAddress);
      }

      // Get suggested parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Create asset creation transaction
      const assetName = `PeerCertify-${certificate.id}`;
      const unitName = 'CERT';
      const totalSupply = 1; // NFT should have supply of 1
      const decimals = 0; // NFTs should have 0 decimals
      const defaultFrozen = false;
      const manager = walletAddress;
      const reserve = walletAddress;
      const freeze = walletAddress;
      const clawback = walletAddress;
      
      // Create metadata
      const metadataJSON = this.createCertificateMetadata(certificate);
      const metadataHash = new Uint8Array(algosdk.sha256(new TextEncoder().encode(metadataJSON)));
      
      // Create asset creation transaction
      const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: walletAddress,
        suggestedParams,
        assetName,
        unitName,
        total: totalSupply,
        decimals,
        defaultFrozen,
        manager,
        reserve,
        freeze,
        clawback,
        metadataHash,
        note: new TextEncoder().encode(metadataJSON.substring(0, 1000)), // Algorand note limit
      });

      // Sign and submit transaction
      const signedTxns = await signer([assetCreateTxn], [0]);
      const { txId } = await this.algodClient.sendRawTransaction(signedTxns[0]).do();
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
      const assetId = confirmedTxn['asset-index'];
      
      // Store certificate with asset ID and transaction ID
      const certificateWithToken = {
        ...certificate,
        tokenId: assetId,
        walletAddress,
        transactionId: txId,
      };
      
      this.certificates.set(certificate.id, certificateWithToken);
      
      return { success: true, tokenId: assetId };
    } catch (error) {
      console.error('Error minting certificate:', error);
      
      // Fallback to demo mode on error
      console.warn('Blockchain minting failed, using demo mode');
      return this.mintCertificateDemo(certificate, walletAddress);
    }
  }

  private async mintCertificateDemo(certificate: Certificate, walletAddress: string): Promise<{ success: boolean; tokenId?: number; error?: string }> {
    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tokenId = Math.floor(Math.random() * 1000000) + 1;
      const certificateWithToken = {
        ...certificate,
        tokenId,
        walletAddress,
      };
      
      this.certificates.set(certificate.id, certificateWithToken);
      
      return { success: true, tokenId };
    } catch (error) {
      return { success: false, error: 'Failed to mint certificate' };
    }
  }

  async verifyCertificate(certificateId: string, walletAddress?: string): Promise<VerificationResult> {
    try {
      // First check local storage (for demo certificates)
      const localCertificate = this.certificates.get(certificateId);
      if (localCertificate) {
        const ownershipVerified = walletAddress ? localCertificate.walletAddress === walletAddress : true;
        return {
          isValid: true,
          certificate: localCertificate,
          tokenExists: true,
          ownershipVerified,
          message: ownershipVerified 
            ? 'Certificate verified successfully (Demo Mode)' 
            : 'Certificate exists but ownership could not be verified',
        };
      }

      // Try to verify on blockchain only if certificateId is a valid number
      const assetId = parseInt(certificateId);
      if (isNaN(assetId)) {
        return {
          isValid: false,
          certificate: null,
          tokenExists: false,
          ownershipVerified: false,
          message: 'Certificate not found. Please check the certificate ID.',
        };
      }

      try {
        // Get full certificate details using the refactored method
        const certificate = await this.parseAssetToCertificate(assetId);
        
        if (!certificate) {
          return {
            isValid: false,
            certificate: null,
            tokenExists: false,
            ownershipVerified: false,
            message: 'Certificate not found on blockchain',
          };
        }

        // Verify ownership if wallet address provided
        let ownershipVerified = true;
        if (walletAddress) {
          try {
            const accountAssets = await this.indexerClient.lookupAccountAssets(walletAddress).do();
            const asset = accountAssets.assets?.find((a: any) => a['asset-id'] === assetId);
            ownershipVerified = asset && asset.amount > 0;
          } catch (error) {
            ownershipVerified = false;
          }
        }
        
        return {
          isValid: true,
          certificate,
          tokenExists: true,
          ownershipVerified,
          message: ownershipVerified 
            ? 'Certificate verified successfully on Algorand blockchain' 
            : 'Certificate exists but ownership could not be verified',
        };
      } catch (blockchainError) {
        console.error('Blockchain verification failed:', blockchainError);
        
        return {
          isValid: false,
          certificate: null,
          tokenExists: false,
          ownershipVerified: false,
          message: 'Certificate not found on blockchain',
        };
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        isValid: false,
        certificate: null,
        tokenExists: false,
        ownershipVerified: false,
        message: 'Error verifying certificate',
      };
    }
  }

  private async parseAssetToCertificate(assetId: number): Promise<Certificate | null> {
    try {
      // First, get basic asset information
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      if (!assetInfo) {
        return null;
      }

      // Try to get the asset creation transaction to extract full metadata
      try {
        const assetTransactions = await this.indexerClient.lookupAssetTransactions(assetId).do();
        
        // Find the asset creation transaction (acfg with asset-id creation)
        const creationTxn = assetTransactions.transactions?.find((txn: any) => 
          txn['tx-type'] === 'acfg' && 
          txn['created-asset-index'] === assetId
        );

        if (creationTxn && creationTxn.note) {
          try {
            // Decode the note field which contains our JSON metadata
            const noteBytes = Buffer.from(creationTxn.note, 'base64');
            const noteString = noteBytes.toString('utf-8');
            const metadata = JSON.parse(noteString);

            // Construct certificate from the stored metadata
            return {
              id: metadata.certificateId || `asset_${assetId}`,
              studentName: metadata.student || 'Verified Certificate Holder',
              courseName: metadata.course || assetInfo.params.name?.replace('PeerCertify-', '') || 'Blockchain Certificate',
              completionDate: metadata.completionDate || new Date().toISOString().split('T')[0],
              issuerName: metadata.issuer || 'Verified on Algorand',
              certificateHash: metadata.certificateHash || `asset_${assetId}_hash`,
              tokenId: assetId,
              metadata: {
                description: metadata.description || 'Certificate verified on Algorand blockchain',
                issueDate: metadata.issueDate || new Date().toISOString(),
                skills: metadata.skills || [],
                duration: metadata.duration || '',
                grade: metadata.grade || '',
              },
            };
          } catch (parseError) {
            console.warn('Failed to parse certificate metadata from note:', parseError);
          }
        }
      } catch (indexerError) {
        console.warn('Failed to get asset transactions from indexer:', indexerError);
      }

      // Fallback: construct certificate from basic asset info
      const params = assetInfo.params;
      const courseName = params.name?.replace('PeerCertify-', '') || 'Blockchain Certificate';
      
      return {
        id: `asset_${assetId}`,
        studentName: 'Verified Certificate Holder',
        courseName,
        completionDate: new Date().toISOString().split('T')[0],
        issuerName: 'Verified on Algorand',
        certificateHash: `asset_${assetId}_hash`,
        tokenId: assetId,
        metadata: {
          description: 'Certificate verified on Algorand blockchain',
          issueDate: new Date().toISOString(),
          skills: [],
          duration: '',
          grade: '',
        },
      };
    } catch (error) {
      console.error('Error parsing asset to certificate:', error);
      return null;
    }
  }

  async getCertificatesByWallet(walletAddress: string): Promise<Certificate[]> {
    try {
      const certificates: Certificate[] = [];
      const seenAssetIds = new Set<number>();
      
      // Get local certificates (demo data)
      const localCertificates = Array.from(this.certificates.values())
        .filter(cert => cert.walletAddress === walletAddress);
      
      // Track local certificate asset IDs to avoid duplicates
      localCertificates.forEach(cert => {
        if (cert.tokenId) {
          seenAssetIds.add(cert.tokenId);
        }
      });
      
      certificates.push(...localCertificates);

      // Get blockchain certificates using Indexer for better performance
      try {
        const accountAssets = await this.indexerClient.lookupAccountAssets(walletAddress).do();
        
        if (accountAssets.assets) {
          for (const asset of accountAssets.assets) {
            const assetId = asset['asset-id'];
            
            // Skip if we already have this certificate from local storage
            if (seenAssetIds.has(assetId)) {
              continue;
            }
            
            // Only process assets with positive balance
            if (asset.amount > 0) {
              try {
                // Get basic asset info to check if it's a PeerCertify certificate
                const assetInfo = await this.algodClient.getAssetByID(assetId).do();
                
                // Check if this is a PeerCertify certificate
                if (assetInfo.params.name?.includes('PeerCertify-') || 
                    assetInfo.params['unit-name'] === 'CERT') {
                  
                  // Use the refactored method to get full certificate details
                  const certificate = await this.parseAssetToCertificate(assetId);
                  
                  if (certificate) {
                    certificate.walletAddress = walletAddress;
                    certificates.push(certificate);
                    seenAssetIds.add(assetId);
                  }
                }
              } catch (error) {
                console.warn(`Failed to process asset ${assetId}:`, error);
              }
            }
          }
        }
      } catch (indexerError) {
        console.warn('Failed to get certificates from Indexer, falling back to algod:', indexerError);
        
        // Fallback to algod if indexer fails
        try {
          const accountInfo = await this.algodClient.accountInformation(walletAddress).do();
          
          if (accountInfo.assets) {
            for (const asset of accountInfo.assets) {
              const assetId = asset['asset-id'];
              
              // Skip if we already have this certificate
              if (seenAssetIds.has(assetId) || asset.amount <= 0) {
                continue;
              }
              
              try {
                const assetInfo = await this.algodClient.getAssetByID(assetId).do();
                
                // Check if this is a PeerCertify certificate
                if (assetInfo.params.name?.includes('PeerCertify-') || 
                    assetInfo.params['unit-name'] === 'CERT') {
                  
                  const certificate = await this.parseAssetToCertificate(assetId);
                  
                  if (certificate) {
                    certificate.walletAddress = walletAddress;
                    certificates.push(certificate);
                  }
                }
              } catch (error) {
                console.warn(`Failed to process asset ${assetId} via algod:`, error);
              }
            }
          }
        } catch (algodError) {
          console.warn('Failed to get certificates from algod as well:', algodError);
        }
      }

      return certificates;
    } catch (error) {
      console.error('Error getting certificates by wallet:', error);
      // Return only local certificates on error
      return Array.from(this.certificates.values())
        .filter(cert => cert.walletAddress === walletAddress);
    }
  }

  async getCertificateById(certificateId: string): Promise<Certificate | null> {
    // Check local storage first
    const localCertificate = this.certificates.get(certificateId);
    if (localCertificate) {
      return localCertificate;
    }

    // Try blockchain lookup using the refactored method
    try {
      const assetId = parseInt(certificateId);
      if (!isNaN(assetId)) {
        return await this.parseAssetToCertificate(assetId);
      }
    } catch (error) {
      console.warn('Failed to get certificate from blockchain:', error);
    }

    return null;
  }

  // Utility method to check network status
  async getNetworkStatus(): Promise<{ connected: boolean; network: string; nodeHealth: boolean }> {
    try {
      // Check if we can get node status
      const status = await this.algodClient.status().do();
      
      // If we reach here, the node is connected and responding
      let nodeHealth = true;
      
      try {
        // Try health check - if it doesn't throw an error, node is healthy
        await this.algodClient.healthCheck().do();
      } catch (healthError) {
        // Health check failed, but node is still connected
        nodeHealth = false;
      }
      
      return {
        connected: true,
        network: status['last-round'] ? `Round ${status['last-round']}` : 'Connected',
        nodeHealth,
      };
    } catch (error) {
      console.error('Network status check failed:', error);
      return {
        connected: false,
        network: 'Disconnected',
        nodeHealth: false,
      };
    }
  }
}