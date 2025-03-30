# DAO Voting App Documentation

## Overview

The DAO Voting App is a decentralized governance platform that allows users to create proposals, vote on them, and delegate voting power to trusted community members. The application uses blockchain technology for secure, transparent voting and provides a modern user interface for interacting with the governance system.

## Current Functionality

### ✅ Fully Functional Features

1. **User Authentication**
   - Email/password registration and login through Firebase
   - Wallet connection via MetaMask
   - Session persistence across page refreshes

2. **Proposal Management**
   - View all proposals with their current status
   - Filter proposals by status (Active, Pending, Succeeded, etc.)
   - Create new proposals (requires governance tokens)
   - View detailed proposal information

3. **On-Chain Voting**
   - Cast votes (For, Against, Abstain) on active proposals
   - Voting requires MetaMask confirmation and Sepolia ETH
   - Vote weight is determined by governance token balance
   - All votes are recorded on the blockchain

4. **Delegation System**
   - Delegate your voting power to trusted community members
   - View active delegates in the community
   - Revoke delegations from your profile page
   - Track delegation status and voting power

5. **Profile Management**
   - View your governance token balance and voting power
   - Manage your wallet connections
   - Track your voting history
   - Manage delegations

6. **Admin Features**
   - Mint governance tokens to users
   - Manage system parameters
   - View platform statistics
   - Send notifications to users

### ⏳ Partially Implemented Features

1. **Dashboard Analytics**
   - Basic statistics are available
   - Advanced graphs and metrics coming soon

2. **Quadratic Voting**
   - Basic implementation exists but requires refinement
   - Weighted voting based on token balance

3. **Private Voting**
   - Infrastructure exists but not fully enabled
   - Requires ZK-proofs for anonymous voting

### 🔜 Upcoming Features

1. **Token Management**
   - Token transfers between users
   - Token rewards for participation

2. **Multi-chain Support**
   - Currently only on Sepolia testnet
   - Mainnet and other chain support planned

3. **Governance Forum**
   - Discussion threads for proposals
   - Community governance tools

4. **Mobile App**
   - Native mobile experience

## How to Use the App

### Setting Up

1. **Create an Account**
   - Register with email/password
   - Verify your email address

2. **Connect Your Wallet**
   - Click "Connect Wallet" in the navbar
   - Confirm the connection in MetaMask
   - Make sure you're on the Sepolia testnet

3. **Get Governance Tokens**
   - Request tokens from an admin user
   - Tokens determine your voting power

### Voting on Proposals

1. **Browse Proposals**
   - Go to the "Proposals" page
   - View active proposals ready for voting

2. **Cast Your Vote**
   - Open a proposal
   - Click "Vote For," "Vote Against," or "Abstain"
   - Confirm the transaction in MetaMask
   - Pay a small gas fee in Sepolia ETH

3. **Check Results**
   - Monitor the proposal's progress
   - See voting results update in real-time

### Creating Proposals

1. **Draft Your Proposal**
   - Click "Create Proposal" button
   - Fill in title, description, and voting period
   - Requires minimum token balance

2. **Submit On-Chain**
   - Confirm submission in MetaMask
   - Pay gas fee to publish on-chain

3. **Track Status**
   - Monitor your proposal's status
   - Engage with voters

### Delegating Votes

1. **Find Delegates**
   - Go to the "Delegates" page
   - Browse active delegates

2. **Delegate Your Votes**
   - Select a delegate
   - Confirm the delegation transaction
   - Your voting power transfers to the delegate

3. **Manage Delegations**
   - View and revoke delegations from your profile
   - Monitor how your delegate votes

### Admin Functions

1. **Access Admin Panel**
   - Admin users see the "Admin" link in the navbar
   - Contains governance management tools

2. **Mint Tokens**
   - Allocate governance tokens to users
   - Requires admin privileges

3. **Manage System Settings**
   - Adjust governance parameters
   - Manage quorum and other settings

## Technical Information

### Smart Contracts

- **Voting Contract**: Handles proposal lifecycle and voting
- **Governance Token**: ERC20 token for voting rights
- **ZK Verifier**: For private voting (partially implemented)

### Network Information

- Currently deployed on **Sepolia Testnet**
- Contract Addresses:
  - Voting: `0xDE789a8e092004e196ac4A88Cd39d5aB8852402c`
  - Governance Token: `0x775F4A912a09291Ae31422b149E0c37760C7AB02`

### Required Resources

- [MetaMask Extension](https://metamask.io/)
- [Sepolia ETH](https://sepoliafaucet.com/) for gas fees
- Governance tokens for voting rights

## Troubleshooting

### Common Issues

1. **Cannot Connect Wallet**
   - Ensure MetaMask is installed
   - Switch to Sepolia testnet
   - Refresh the page and try again

2. **Cannot Vote**
   - Check that you have Sepolia ETH for gas
   - Verify you have governance tokens
   - Make sure the proposal is active

3. **Transactions Failing**
   - Increase gas limit in MetaMask
   - Check your Sepolia ETH balance
   - Ensure network is not congested

### Getting Help

- Contact the development team via Discord
- Check GitHub issues for known problems
- Refer to this documentation for guidance

## Development Roadmap

### Q2 2023 (Completed)
- Smart contract development
- Basic UI implementation
- Firebase integration

### Q3 2023 (Completed)
- On-chain voting
- Delegation system
- User profiles

### Q4 2023 (Current)
- Refining UI/UX
- Implementing admin features
- On-chain/off-chain synchronization

### Q1 2024 (Upcoming)
- Mainnet deployment
- Advanced analytics
- Mobile responsive design

### Q2 2024 (Planned)
- Mobile app development
- Multi-chain support
- Governance forum 