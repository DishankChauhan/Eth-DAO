# DAO Voting App - v1.0.0

A decentralized governance application that allows creating proposals, on-chain voting, and delegation - built with Solidity, Next.js, and Firebase.

## Features

- 🔒 **Secure Authentication**: Email/password login and wallet connection
- 📜 **On-Chain Proposals**: Create and manage proposals stored on Sepolia testnet
- 🗳️ **Blockchain Voting**: Vote directly on-chain with your governance tokens
- 👥 **Delegation System**: Delegate your voting power to trusted community members
- 📊 **Governance Dashboard**: Monitor voting activity and proposal statuses
- 👨‍💼 **Admin Panel**: Mint tokens and manage governance parameters

## Quick Start

### Prerequisites

- Node.js v16+
- MetaMask browser extension
- Sepolia testnet ETH for gas fees
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dao-voting-app.git
   cd dao-voting-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update your `.env.local` with the following values:
   ```
   # Blockchain config
   SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
   
   # Contract addresses (from deployment)
   NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS=YOUR_VOTING_CONTRACT_ADDRESS
   NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS=YOUR_GOVERNANCE_TOKEN_ADDRESS
   
   # Firebase config
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   ```

### Deploy Contracts

1. Deploy contracts to Sepolia testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

2. Verify contracts on Etherscan:
   ```bash
   npx hardhat verify --network sepolia YOUR_VOTING_CONTRACT_ADDRESS
   npx hardhat verify --network sepolia YOUR_GOVERNANCE_TOKEN_ADDRESS
   ```

3. Update your `.env.local` with the deployed contract addresses.

### Run the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Production Deployment

Use the included deployment script to prepare for production:

```bash
chmod +x production-deployment.sh
./production-deployment.sh
```

The script will:
1. Check dependencies and environment variables
2. Run tests and build the application
3. Guide you through contract deployment if needed
4. Provide instructions for hosting on Vercel or Netlify

## Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Email/Password authentication
3. Create a Firestore database with the following collections:
   - `users`
   - `proposals`
   - `comments`
   - `delegations`
4. Set up Firestore rules:
   ```
   chmod +x deploy-firebase-rules.js
   node deploy-firebase-rules.js
   ```

## Getting Sepolia ETH

You'll need Sepolia ETH to interact with the blockchain. Get some from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)

## Documentation

For detailed documentation, see [the full app documentation](docs/APP_DOCUMENTATION.md).

## Known Issues in v1.0.0

- Delegation UI may not show all delegates without manual refresh
- Admin page requires whitelisted wallets (See AuthContext.tsx)
- Some fallback to mock data when blockchain connection fails
- Fixed wallet addresses in admin whitelist

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
