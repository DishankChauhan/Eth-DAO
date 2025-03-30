import { Metadata } from 'next';
import { getProposal } from '@/services/contractService';
import logger from '@/utils/logger';
import ClientProposalDetail from './ClientProposalDetail';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const proposalId = parseInt(params.id);
    const proposal = await getProposal(proposalId);
    
    if (!proposal) {
      return {
        title: 'Proposal Not Found',
        description: 'The requested proposal could not be found'
      };
    }
    
    return {
      title: `${proposal.title} | Proposal #${proposalId}`,
      description: proposal.description.substring(0, 160)
    };
  } catch (error) {
    // Log error but continue with default metadata - avoid breaking the page
    logger.error('Error generating metadata:', error);
    return {
      title: `Proposal #${params.id}`,
      description: 'View proposal details and vote'
    };
  }
}

// This is a workaround for the error that can occur during SSR
// when trying to access window.ethereum in getProposal
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  return <ClientProposalDetail id={params.id} />;
} 