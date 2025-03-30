#!/bin/bash

# DAO Voting App Production Deployment Script
echo "=== Starting DAO Voting App Production Deployment ==="

# 1. Install dependencies
echo "Installing dependencies..."
npm install

# 2. Set up environment variables
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.local.example..."
  cp .env.local.example .env.local
  echo "IMPORTANT: Please edit .env.local with your production values"
  exit 1
fi

# 3. Run tests
echo "Running tests..."
npx hardhat test

# 4. Build the application
echo "Building application..."
npm run build

# 5. Check for production optimizations
echo "Checking for production optimizations..."
npx next build

# 6. Deploy contracts if needed (requires configured .env.local)
read -p "Do you want to deploy contracts to Sepolia? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Deploying contracts to Sepolia..."
  npx hardhat run scripts/deploy.js --network sepolia
fi

# 7. Verify contracts on Etherscan (if deployed)
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Do you want to verify contracts on Etherscan? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Verifying contracts on Etherscan..."
    # Get contract addresses from deployment
    VOTING_CONTRACT=$(grep "Voting contract deployed to:" scripts/deploy-output.txt | awk '{print $5}')
    TOKEN_CONTRACT=$(grep "Token contract deployed to:" scripts/deploy-output.txt | awk '{print $5}')
    
    # Verify contracts
    npx hardhat verify --network sepolia $VOTING_CONTRACT
    npx hardhat verify --network sepolia $TOKEN_CONTRACT
  fi
fi

# 8. Final instructions for deployment
echo "=== DAO Voting App Production Build Complete ==="
echo ""
echo "To deploy your application:"
echo "1. Use your preferred hosting provider (Vercel, Netlify, etc.)"
echo "2. Set up the following environment variables on your hosting platform:"
echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   - NEXT_PUBLIC_FIREBASE_APP_ID"
echo "   - NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS"
echo "   - NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS"
echo "3. Deploy the application from your hosting dashboard"
echo ""
echo "For Vercel deployment, run: vercel --prod"
echo "For Netlify deployment, run: netlify deploy --prod"
echo "" 