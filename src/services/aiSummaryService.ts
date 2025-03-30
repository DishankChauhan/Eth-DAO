import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, setDoc, query, where, orderBy, limit } from 'firebase/firestore';
import logger from '@/utils/logger';
import { getProposal, getVoters } from './contractService';

// Interface for vote summary
export interface VoteSummary {
  proposalId: number;
  summary: string;
  insights: string[];
  votingTrends: {
    forPercentage: number;
    againstPercentage: number;
    abstainPercentage: number;
    totalVotes: number;
    quorumReached: boolean;
    majorityReached: boolean;
  };
  whaleActivity: {
    largestVoters: {
      address: string;
      votingPower: number;
      voteType: string;
    }[];
    whaleInfluence: number;
  };
  timestamp: number;
  lastUpdated: number;
}

/**
 * Generate a vote summary for a proposal using AI analysis
 * @param proposalId The proposal ID to generate summary for
 * @param forceRefresh Whether to force a refresh of the summary
 */
export const generateVoteSummary = async (
  proposalId: number, 
  forceRefresh: boolean = false
): Promise<VoteSummary | null> => {
  try {
    logger.debug(`Generating vote summary for proposal ${proposalId}`);
    
    // Check if we already have a recent summary
    if (!forceRefresh) {
      const existingSummary = await getExistingSummary(proposalId);
      if (existingSummary && (Date.now() - existingSummary.lastUpdated < 30 * 60 * 1000)) {
        // Summary is less than 30 minutes old
        logger.debug(`Using existing summary for proposal ${proposalId}`);
        return existingSummary;
      }
    }
    
    // Get proposal details
    const proposal = await getProposal(proposalId);
    if (!proposal) {
      logger.error(`Proposal ${proposalId} not found`);
      return null;
    }
    
    // Get votes
    const votes = await getVoters(proposalId);
    if (!votes || votes.length === 0) {
      logger.warn(`No votes found for proposal ${proposalId}`);
      
      // Create a simple summary for proposals with no votes
      const emptySummary: VoteSummary = {
        proposalId,
        summary: "This proposal has not received any votes yet.",
        insights: ["No voting activity to analyze."],
        votingTrends: {
          forPercentage: 0,
          againstPercentage: 0,
          abstainPercentage: 0,
          totalVotes: 0,
          quorumReached: false,
          majorityReached: false
        },
        whaleActivity: {
          largestVoters: [],
          whaleInfluence: 0
        },
        timestamp: Date.now(),
        lastUpdated: Date.now()
      };
      
      // Save to database
      await saveSummary(emptySummary);
      
      return emptySummary;
    }
    
    // Calculate voting trends
    const totalVotes = votes.length;
    const forVotes = votes.filter((v: { support: number; }) => v.support === 1).length;
    const againstVotes = votes.filter((v: { support: number; }) => v.support === 0).length;
    const abstainVotes = votes.filter((v: { support: number; }) => v.support === 2).length;
    
    const forPercentage = (forVotes / totalVotes) * 100;
    const againstPercentage = (againstVotes / totalVotes) * 100;
    const abstainPercentage = (abstainVotes / totalVotes) * 100;
    
    // Calculate voting power by type
    const totalVotingPower = votes.reduce((sum: any, vote: { votes: any; }) => sum + vote.votes, 0);
    const forVotingPower = votes.filter((v: { support: number; }) => v.support === 1).reduce((sum: any, vote: { votes: any; }) => sum + vote.votes, 0);
    const againstVotingPower = votes.filter((v: { support: number; }) => v.support === 0).reduce((sum: any, vote: { votes: any; }) => sum + vote.votes, 0);
    
    // Identify the largest voters (whales)
    const sortedVotesByPower = [...votes].sort((a, b) => b.votes - a.votes);
    const largestVoters = sortedVotesByPower.slice(0, 3).map(vote => {
      // Ensure address is a string by creating a fallback
      const addressStr = typeof vote.votes === 'number' ? `Voter-${vote.votes}` : "Unknown";
      
      return {
        address: addressStr,
        votingPower: vote.votes,
        voteType: vote.support === 1 ? 'For' : vote.support === 0 ? 'Against' : 'Abstain'
      };
    });
    
    // Calculate whale influence (percentage of voting power from top 3 voters)
    const whaleVotingPower = largestVoters.reduce((sum, voter) => sum + voter.votingPower, 0);
    const whaleInfluence = (whaleVotingPower / totalVotingPower) * 100;
    
    // Determine if quorum and majority are reached
    // Note: These thresholds should come from contract in production
    const quorumThreshold = 10; // Example threshold
    const quorumReached = totalVotingPower >= quorumThreshold;
    const majorityReached = forVotingPower > againstVotingPower;
    
    // Generate insights based on voting data
    const insights = generateInsights(
      proposal.title,
      proposal.description,
      forPercentage,
      againstPercentage,
      abstainPercentage,
      quorumReached,
      majorityReached,
      whaleInfluence,
      totalVotes
    );
    
    // Generate summary text
    const summary = generateSummaryText(
      proposal.title,
      forPercentage,
      againstPercentage,
      abstainPercentage,
      quorumReached,
      majorityReached,
      totalVotes
    );
    
    // Create summary object
    const voteSummary: VoteSummary = {
      proposalId,
      summary,
      insights,
      votingTrends: {
        forPercentage,
        againstPercentage,
        abstainPercentage,
        totalVotes,
        quorumReached,
        majorityReached
      },
      whaleActivity: {
        largestVoters,
        whaleInfluence
      },
      timestamp: Date.now(),
      lastUpdated: Date.now()
    };
    
    // Save to database
    await saveSummary(voteSummary);
    
    logger.debug(`Vote summary generated for proposal ${proposalId}`);
    return voteSummary;
  } catch (error) {
    logger.error(`Error generating vote summary for proposal ${proposalId}:`, error);
    return null;
  }
};

/**
 * Get an existing summary from the database
 */
const getExistingSummary = async (proposalId: number): Promise<VoteSummary | null> => {
  try {
    const summaryRef = doc(db, 'voteSummaries', proposalId.toString());
    const summarySnap = await getDoc(summaryRef);
    
    if (!summarySnap.exists()) {
      return null;
    }
    
    return summarySnap.data() as VoteSummary;
  } catch (error) {
    logger.error(`Error fetching existing summary for proposal ${proposalId}:`, error);
    return null;
  }
};

/**
 * Save a vote summary to the database
 */
const saveSummary = async (summary: VoteSummary): Promise<void> => {
  try {
    const summaryRef = doc(db, 'voteSummaries', summary.proposalId.toString());
    await setDoc(summaryRef, summary);
    logger.debug(`Summary saved for proposal ${summary.proposalId}`);
  } catch (error) {
    logger.error(`Error saving summary for proposal ${summary.proposalId}:`, error);
  }
};

/**
 * Generate insights based on voting data
 * In a production environment, this would call an AI service
 */
const generateInsights = (
  title: string,
  description: string,
  forPercentage: number,
  againstPercentage: number,
  abstainPercentage: number,
  quorumReached: boolean,
  majorityReached: boolean,
  whaleInfluence: number,
  totalVotes: number
): string[] => {
  // This is a mock implementation that simulates AI-generated insights
  // In production, you would use a real AI service like OpenAI, Claude, etc.
  const insights: string[] = [];
  
  // Add insight based on vote distribution
  if (forPercentage > 75) {
    insights.push(`Strong consensus in favor of the proposal with ${forPercentage.toFixed(1)}% voting in support.`);
  } else if (againstPercentage > 75) {
    insights.push(`Strong opposition to the proposal with ${againstPercentage.toFixed(1)}% voting against.`);
  } else if (Math.abs(forPercentage - againstPercentage) < 10) {
    insights.push(`The community is closely divided on this proposal with only ${Math.abs(forPercentage - againstPercentage).toFixed(1)}% difference between support and opposition.`);
  }
  
  // Add insight based on abstain votes
  if (abstainPercentage > 20) {
    insights.push(`Significant number of voters (${abstainPercentage.toFixed(1)}%) have abstained, suggesting uncertainty or neutrality about this proposal.`);
  }
  
  // Add insight based on quorum
  if (!quorumReached) {
    insights.push("Quorum has not been reached yet, indicating low participation relative to the required threshold.");
  } else if (totalVotes < 20) {
    insights.push("While quorum has been reached, overall participation remains relatively low.");
  } else {
    insights.push("Strong participation has been observed for this proposal, with quorum being reached.");
  }
  
  // Add insight based on whale influence
  if (whaleInfluence > 50) {
    insights.push(`High concentration of voting power with top voters controlling ${whaleInfluence.toFixed(1)}% of votes, raising centralization concerns.`);
  } else if (whaleInfluence < 20) {
    insights.push(`Voting power is well distributed with top voters controlling only ${whaleInfluence.toFixed(1)}% of votes.`);
  }
  
  // Add insight based on vote outcome projection
  if (majorityReached && quorumReached) {
    insights.push("Based on current voting trends, this proposal is on track to pass.");
  } else if (!majorityReached && quorumReached) {
    insights.push("Based on current voting trends, this proposal is unlikely to pass.");
  }
  
  return insights;
};

/**
 * Generate a summary text based on voting data
 * In a production environment, this would call an AI service
 */
const generateSummaryText = (
  title: string,
  forPercentage: number,
  againstPercentage: number,
  abstainPercentage: number,
  quorumReached: boolean,
  majorityReached: boolean,
  totalVotes: number
): string => {
  // This is a mock implementation that simulates AI-generated text
  // In production, you would use a real AI service like OpenAI, Claude, etc.
  
  let summaryText = `This proposal has received votes from ${totalVotes} participants, with `;
  
  if (forPercentage > againstPercentage) {
    summaryText += `a majority (${forPercentage.toFixed(1)}%) voting in favor`;
  } else {
    summaryText += `a majority (${againstPercentage.toFixed(1)}%) voting against`;
  }
  
  if (abstainPercentage > 5) {
    summaryText += ` and ${abstainPercentage.toFixed(1)}% choosing to abstain. `;
  } else {
    summaryText += `. `;
  }
  
  if (quorumReached) {
    summaryText += "The proposal has reached the required quorum for a valid vote. ";
  } else {
    summaryText += "The proposal has not yet reached the required quorum. ";
  }
  
  if (quorumReached && majorityReached) {
    summaryText += "Based on the current votes, the proposal is likely to pass.";
  } else if (quorumReached && !majorityReached) {
    summaryText += "Based on the current votes, the proposal is unlikely to pass.";
  } else {
    summaryText += "More votes are needed before the outcome can be determined.";
  }
  
  return summaryText;
};

/**
 * Get a vote summary for a proposal
 * @param proposalId The proposal ID to get summary for
 * @param forceRefresh Whether to force regeneration of the summary
 */
export const getVoteSummary = async (
  proposalId: number,
  forceRefresh: boolean = false
): Promise<VoteSummary | null> => {
  return generateVoteSummary(proposalId, forceRefresh);
}; 