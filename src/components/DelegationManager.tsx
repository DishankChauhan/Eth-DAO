'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  delegateVotes, 
  undelegateVotes, 
  getDelegationStatus, 
  getVotingPower,
  ContractServiceError,
  ContractErrorType
} from '@/services/contractService';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import Link from 'next/link';
import { logger } from '@/utils/logger';
import { validateEthereumAddress } from '@/utils/formValidation';

// Helper function to get user-friendly error message
const getErrorMessage = (error: any): string => {
  if (error instanceof ContractServiceError) {
    return error.message;
  }
  
  // Fallback to default message or error message
  return error?.message || 'An unknown error occurred';
};

// Helper function to truncate Ethereum addresses
const truncateAddress = (address: string) => {
  if (!address) return '';
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};

const DelegationManager = () => {
  const { user } = useAuth();
  const [delegateAddress, setDelegateAddress] = useState('');
  const [delegationStatus, setDelegationStatus] = useState<{
    isDelegating: boolean;
    delegatedTo: string;
    votingPower: string;
  }>({
    isDelegating: false,
    delegatedTo: ethers.ZeroAddress,
    votingPower: '0'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form validation
  const [addressError, setAddressError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const fetchDelegationStatus = async () => {
    if (!user?.walletAddress) return;
    
    try {
      setIsLoading(true);
      const status = await getDelegationStatus(user.walletAddress);
      setDelegationStatus(status);
      
      logger.debug('Delegation status fetched', status);
    } catch (error) {
      logger.error('Error fetching delegation status:', error);
      toast.error(getErrorMessage(error) || 'Failed to fetch delegation status');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDelegationStatus();
  }, [user]);

  // Validate the address when it changes
  useEffect(() => {
    if (touched) {
      validateAddress(delegateAddress);
    }
  }, [delegateAddress, touched]);

  const validateAddress = (address: string) => {
    // Basic validation
    if (!address.trim()) {
      setAddressError('Address is required');
      return false;
    }
    
    // Make sure it's a valid Ethereum address
    if (!ethers.isAddress(address)) {
      setAddressError('Invalid Ethereum address');
      return false;
    }
    
    // Check for zero address
    if (address === ethers.ZeroAddress) {
      setAddressError('Cannot delegate to zero address');
      return false;
    }
    
    // Check for self-delegation
    if (user?.walletAddress && address.toLowerCase() === user.walletAddress.toLowerCase()) {
      setAddressError('Cannot delegate to yourself');
      return false;
    }
    
    setAddressError(null);
    return true;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDelegationStatus();
    toast.success('Refreshing delegation status...');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelegateAddress(e.target.value);
    setTouched(true);
  };

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched(true);
    
    // Validate the address
    if (!validateAddress(delegateAddress)) {
      return;
    }
    
    try {
      setIsProcessing(true);
      const success = await delegateVotes(delegateAddress);
      
      if (success) {
        toast.success('Successfully delegated votes');
        setDelegateAddress('');
        setTouched(false);
        
        // Refresh delegation status
        await fetchDelegationStatus();
      }
    } catch (error) {
      logger.error('Error delegating votes:', error);
      toast.error(getErrorMessage(error) || 'Failed to delegate votes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndelegate = async () => {
    if (!delegationStatus.isDelegating) {
      toast.error('You are not currently delegating your votes');
      return;
    }
    
    // Add confirmation to prevent accidental undelegation
    if (!confirm('Are you sure you want to remove your vote delegation? This will return your voting power to your own address.')) {
      return;
    }
    
    try {
      setIsProcessing(true);
      const success = await undelegateVotes();
      
      if (success) {
        toast.success('Successfully undelegated votes');
        
        // Refresh delegation status
        await fetchDelegationStatus();
      }
    } catch (error) {
      logger.error('Error undelegating votes:', error);
      toast.error(getErrorMessage(error) || 'Failed to undelegate votes');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user?.walletAddress) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Vote Delegation</h2>
        <p className="text-gray-400">Please connect your wallet to manage vote delegation.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Vote Delegation</h2>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-indigo-400 hover:text-indigo-300 flex items-center text-sm disabled:opacity-50"
        >
          <svg className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Your Voting Power:</span>
              <span className="text-indigo-400 font-medium">{parseFloat(delegationStatus.votingPower).toFixed(2)} votes</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Delegation Status:</span>
              <span className={`font-medium ${delegationStatus.isDelegating ? 'text-green-400' : 'text-gray-400'}`}>
                {delegationStatus.isDelegating 
                  ? `Delegated to ${truncateAddress(delegationStatus.delegatedTo)}`
                  : 'Not delegating'}
              </span>
            </div>
          </div>
          
          {delegationStatus.isDelegating ? (
            <div className="mb-6">
              <p className="text-gray-300 mb-3">
                You are currently delegating your voting power to:
              </p>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg mb-4">
                <span className="font-mono text-indigo-400">{delegationStatus.delegatedTo}</span>
                <a 
                  href={`https://etherscan.io/address/${delegationStatus.delegatedTo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded transition"
                >
                  View on Etherscan
                </a>
              </div>
              <button
                onClick={handleUndelegate}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Undelegate Votes'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleDelegate} className="mb-6">
              <p className="text-gray-300 mb-3">
                Delegate your voting power to another address. This allows someone else to vote on your behalf without transferring your tokens.
              </p>
              
              <div className="mb-4">
                <label htmlFor="delegateAddress" className="block text-gray-400 text-sm mb-2">
                  Delegate Address
                </label>
                <input 
                  type="text"
                  id="delegateAddress"
                  placeholder="0x..."
                  value={delegateAddress}
                  onChange={handleAddressChange}
                  className={`w-full px-4 py-2 rounded bg-gray-800 text-white border ${
                    addressError ? 'border-red-500' : 'border-gray-700'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 focus:outline-none`}
                />
                {addressError && (
                  <p className="mt-1 text-sm text-red-500">{addressError}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isProcessing || !!addressError || !delegateAddress}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Delegate Votes'
                )}
              </button>
            </form>
          )}
          
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-medium text-white mb-2">What is Vote Delegation?</h3>
            <p className="text-gray-400 text-sm mb-3">
              Vote delegation allows you to designate another address to vote on your behalf without transferring your tokens.
              It's useful when you want to participate in governance but prefer to let someone else make voting decisions.
            </p>
            <p className="text-gray-400 text-sm">
              Your delegated votes can be reclaimed at any time by undelegating.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DelegationManager; 