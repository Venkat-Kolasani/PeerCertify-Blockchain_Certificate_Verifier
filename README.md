## Built for Worlds Largest Hackathon by BOLT 

## About the Project – PeerCertify

## 🧠 Inspiration
In a world where online learning is booming, verifying certificates has become increasingly critical — yet the current system is heavily reliant on centralized platforms that are easy to manipulate or fake. PeerCertify was born out of the need to bring trustless, tamper-proof verification to digital credentials using blockchain. We wanted to solve a real-world problem where employers can instantly verify the authenticity of certificates without needing to email or depend on third parties.

## ⚙️ What it Does
PeerCertify lets any course platform issue course completion certificates as Algorand-based NFTs. These NFTs act as publicly verifiable credentials stored immutably on the blockchain.

## Key Features:

Course platforms can mint certificates as NFTs with embedded metadata (student name, course, date).

Each NFT is tied to the recipient’s wallet.

Employers or institutions can verify certificates by viewing them on-chain using a simple public URL or wallet address.

All verification is trustless — no central authority needed.

## 🏗️ How We Built It
We used React and Tailwind CSS to build the frontend for both issuers and verifiers.

The backend is built with Node.js + Express, managing API routes for minting certificates.

The Algorand SDK (JavaScript) was used to interact with the blockchain and mint NFTs.

MyAlgo Connect was used to handle wallet connections and transactions.

Metadata was either stored directly on-chain or via IPFS for better scalability.


## 🚧 Challenges We Faced
Learning how to mint NFTs on Algorand and manage wallet interactions securely.

Handling async blockchain confirmations and syncing them with the UI.

Ensuring the frontend/backend works seamlessly within Bolt.new/WebContainer’s constraints.

Deciding the best way to structure and store metadata — on-chain vs off-chain (IPFS).

Making the verification process simple enough for non-technical users while maintaining full decentralization.

## ✅ Accomplishments We're Proud Of
Issuing real certificates on Algorand with working metadata and wallet ownership.

Making certificate verification public, decentralized, and elegant.

Creating a smooth issuer-verifier experience that feels like Web2 but works on Web3 rails.

Keeping everything self-contained with working deployment in a hackathon timeframe.

## 📚 What We Learned
How to build dApps using Algorand SDK and MyAlgo Wallet

Best practices for verifying ownership of NFTs

UI/UX considerations for blockchain-based products

Practical applications of blockchain outside DeFi — in edtech and HR

## 🚀 What's Next for PeerCertify
Allow issuers to batch mint certificates for large cohorts.

Add an optional QR code on certificates to directly open verification pages.

Enable revocation or expiration of certificates using smart contract logic.

Integration with LinkedIn or resumes for verified badges.

Support other EVM-compatible chains via abstraction layer.

## Built with :
Languages: TypeScript, JavaScript
Frontend Framework/Library: React
Styling: Tailwind CSS
Routing: React Router DOM
Icons: Lucide React
Blockchain Integration: Algorand SDK (algosdk) for interacting with the Algorand blockchain.
Wallet Integration: MyAlgoConnect and Pera Wallet for connecting to Algorand wallets.
Build Tool: Vite
Linting: ESLint with TypeScript ESLint
Post-processing CSS: PostCSS, Autoprefixer
Platform: Bolt (as indicated by the "Built with Bolt" badge)


