'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { VoteSupport } from '@/types/proposal';
import { castVote, getVotingPower } from '@/services/contractService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, XCircle, MinusCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

interface ProposalVoteFormProps {
  proposalId: number;
  hasVoted: boolean;
  isActive: boolean;
  onVoteSuccess?: () => void;
  className?: string;
}

export default function ProposalVoteForm({
  proposalId,
  hasVoted,
  isActive,
  onVoteSuccess,
  className = ''
}: ProposalVoteFormProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isVoting, setIsVoting] = useState(false);
  const [votingPower, setVotingPower] = useState<number | null>(null);
  const [selectedVote, setSelectedVote] = useState<VoteSupport | null>(null);
  
  // Load voting power on component mount
  useEffect(() => {
    const loadVotingPower = async () => {
      if (!address) return;
      
      try {
        const power = await getVotingPower(address);
        setVotingPower(parseFloat(power));
      } catch (error) {
        console.error('Error loading voting power:', error);
      }
    };
    
    loadVotingPower();
  }, [address]);
  
  const handleVote = async (support: VoteSupport) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (hasVoted) {
      toast.error('You have already voted on this proposal');
      return;
    }
    
    if (!isActive) {
      toast.error('This proposal is not active for voting');
      return;
    }
    
    // Check if user has Sepolia ETH before proceeding
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(signer.getAddress());
        
        // If balance is zero, show error
        if (balance <= BigInt(0)) {
          toast.error('You need Sepolia ETH to vote on this proposal. Please get some from a faucet.');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking ETH balance:', error);
    }
    
    try {
      setIsVoting(true);
      setSelectedVote(support);
      
      // Cast the vote on-chain (this will trigger MetaMask)
      await castVote(proposalId, support);
      
      toast.success('Your vote has been cast successfully on the blockchain!');
      
      // Update voting power after successful vote (reduce it slightly)
      if (votingPower !== null) {
        // Reduce voting power by 5% to reflect the vote cost
        const newPower = votingPower * 0.95;
        setVotingPower(newPower);
      }
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
      
      // Refresh the page to show the updated state
      router.refresh();
    } catch (error: any) {
      console.error('Error casting vote:', error);
      
      // More descriptive error message based on error type
      if (error.message?.includes('rejected')) {
        toast.error('Transaction rejected. Please confirm the transaction in MetaMask to vote.');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient Sepolia ETH to pay for the transaction. Please get some from a faucet.');
      } else {
        toast.error('Failed to cast your vote: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsVoting(false);
      setSelectedVote(null);
    }
  };
  
  if (!isActive) {
    return null;
  }
  
  if (hasVoted) {
    return (
      <Card className={`bg-green-900/20 border-green-500/50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-green-400">
            <CheckCircle className="h-8 w-8 mr-2" />
            <p className="text-lg font-medium">You've already voted on this proposal</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 space-x-2"
            disabled={isVoting}
            onClick={() => handleVote(VoteSupport.For)}
          >
            {isVoting && selectedVote === VoteSupport.For ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>Vote For</span>
          </Button>
          
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 space-x-2"
            disabled={isVoting}
            onClick={() => handleVote(VoteSupport.Against)}
          >
            {isVoting && selectedVote === VoteSupport.Against ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>Vote Against</span>
          </Button>
          
          <Button
            className="flex-1 bg-gray-600 hover:bg-gray-700 space-x-2"
            disabled={isVoting}
            onClick={() => handleVote(VoteSupport.Abstain)}
          >
            {isVoting && selectedVote === VoteSupport.Abstain ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MinusCircle className="h-4 w-4" />
            )}
            <span>Abstain</span>
          </Button>
        </div>
        
        {votingPower !== null && (
          <p className="text-sm text-center mt-4 text-muted-foreground">
            Your voting power: {votingPower.toFixed(2)}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <div className="w-full text-center">
          <p>Your vote will be recorded on the blockchain and cannot be changed</p>
        </div>
      </CardFooter>
    </Card>
  );
} 