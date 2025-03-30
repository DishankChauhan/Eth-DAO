'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getProposal } from '@/services/contractService';
import { ProposalState } from '@/types/proposal';
import ProposalVotesView from '@/components/proposal/ProposalVotesView';
import VotingInterface from '@/components/VotingInterface';
import logger from '@/utils/logger';

// Helper function to format dates
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Helper function for proposal state classes
function getStateClass(state: ProposalState) {
  switch (state) {
    case ProposalState.Active:
      return 'bg-blue-600';
    case ProposalState.Succeeded:
      return 'bg-green-600';
    case ProposalState.Executed:
      return 'bg-green-700';
    case ProposalState.Defeated:
      return 'bg-red-600';
    case ProposalState.Canceled:
      return 'bg-gray-600';
    case ProposalState.Expired:
      return 'bg-yellow-600';
    case ProposalState.Pending:
      return 'bg-purple-600';
    default:
      return 'bg-gray-600';
  }
}

// Helper function for proposal state text
function getProposalStateText(state: ProposalState) {
  switch (state) {
    case ProposalState.Pending:
      return 'Pending';
    case ProposalState.Active:
      return 'Active';
    case ProposalState.Canceled:
      return 'Canceled';
    case ProposalState.Defeated:
      return 'Defeated';
    case ProposalState.Succeeded:
      return 'Succeeded';
    case ProposalState.Executed:
      return 'Executed';
    case ProposalState.Expired:
      return 'Expired';
    default:
      return 'Unknown';
  }
}

export default function ClientProposalDetail({ id }: { id: string }) {
  const proposalId = parseInt(id);
  
  const [proposal, setProposal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProposal() {
      try {
        setIsLoading(true);
        const data = await getProposal(proposalId);
        setProposal(data);
        setError(null);
        
        // Update document title
        if (data) {
          document.title = `${data.title} | Proposal #${proposalId}`;
        }
      } catch (err) {
        logger.error('Error fetching proposal:', err);
        setError('Failed to load proposal details');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);
  
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded mb-6 w-1/2"></div>
            <div className="h-32 bg-gray-800 rounded mb-6"></div>
            <div className="h-24 bg-gray-800 rounded"></div>
          </div>
        </div>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg">
          <p className="text-red-300">{error}</p>
          <Link href="/proposals" className="text-blue-400 hover:underline mt-2 inline-block">
            Back to Proposals
          </Link>
        </div>
      </main>
    );
  }
  
  if (!proposal) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Proposal Not Found</h1>
          <p className="text-gray-400 mb-4">The proposal you're looking for doesn't exist or has been removed.</p>
          <Link href="/proposals" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition">
            Back to Proposals
          </Link>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{proposal.title}</h1>
            <span className={`text-xs font-semibold px-2 py-1 rounded text-white ${getStateClass(proposal.status)}`}>
              {getProposalStateText(proposal.status)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm mb-6">
            <span className="mr-4">
              {proposal.status === ProposalState.Active 
                ? `Ends ${formatDate(proposal.endTime)}`
                : `Ended ${formatDate(proposal.endTime)}`
              }
            </span>
            <span>Created {formatDate(proposal.startTime)}</span>
          </div>
          
          <div className="border-b border-gray-800 mb-6 pb-6">
            <p className="text-gray-300 whitespace-pre-line">{proposal.description}</p>
          </div>
          
          <div className="space-y-8">
            {/* Voting Stats */}
            <div className="rounded-lg border border-gray-800 p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Voting Results</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-800">
                  <div className="text-green-400 text-sm">For</div>
                  <div className="text-white text-xl font-bold">{proposal.forVotes.toLocaleString()} votes</div>
                  <div className="text-green-500 text-sm">
                    {((proposal.forVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes || 1)) * 100).toFixed(2)}%
                  </div>
                </div>
                
                <div className="bg-red-900/20 p-3 rounded-lg border border-red-800">
                  <div className="text-red-400 text-sm">Against</div>
                  <div className="text-white text-xl font-bold">{proposal.againstVotes.toLocaleString()} votes</div>
                  <div className="text-red-500 text-sm">
                    {((proposal.againstVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes || 1)) * 100).toFixed(2)}%
                  </div>
                </div>
                
                <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-800">
                  <div className="text-yellow-400 text-sm">Abstain</div>
                  <div className="text-white text-xl font-bold">{proposal.abstainVotes.toLocaleString()} votes</div>
                  <div className="text-yellow-500 text-sm">
                    {((proposal.abstainVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes || 1)) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
              
              {/* Voting Progress Bar */}
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ 
                    width: `${((proposal.forVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes || 1)) * 100).toFixed(2)}%`,
                    float: 'left'
                  }}
                ></div>
                <div 
                  className="h-full bg-red-500" 
                  style={{ 
                    width: `${((proposal.againstVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes || 1)) * 100).toFixed(2)}%`,
                    float: 'left'
                  }}
                ></div>
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ 
                    width: `${((proposal.abstainVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes || 1)) * 100).toFixed(2)}%`,
                    float: 'left'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Voting Interface (client component) */}
            <Suspense fallback={<div className="h-20 bg-gray-800 animate-pulse rounded-lg"></div>}>
              <VotingInterface proposalId={proposalId} />
            </Suspense>
          </div>
        </div>
        
        {/* Votes Section */}
        <div className="mt-10">
          <Suspense fallback={<div className="h-40 bg-gray-800 animate-pulse rounded-lg"></div>}>
            <ProposalVotesView proposalId={proposalId} />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 