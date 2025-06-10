export interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  issuerName: string;
  certificateHash: string;
  tokenId?: number;
  walletAddress?: string;
  transactionId?: string;
  metadata: {
    description: string;
    issueDate: string;
    skills: string[];
    duration: string;
    grade?: string;
  };
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export interface VerificationResult {
  isValid: boolean;
  certificate: Certificate | null;
  tokenExists: boolean;
  ownershipVerified: boolean;
  message: string;
}

export interface AlgorandNetworkStatus {
  connected: boolean;
  network: string;
  nodeHealth: boolean;
}