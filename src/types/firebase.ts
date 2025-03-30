import { ProposalState } from '@/types/proposal';

/**
 * Types for Firebase data models
 */

/**
 * Base vote structure
 */
export interface BaseVote {
  proposalId: number;
  support: number;
  votes: number;
  timestamp: number;
}

/**
 * Standard vote with voter address
 */
export interface Vote extends BaseVote {
  voter: string;
}

/**
 * Private vote with proof instead of voter
 */
export interface PrivateVote extends BaseVote {
  proofId: string;
  isPrivate: boolean;
}

/**
 * Firebase proposal data structure
 */
export interface FirebaseProposal {
  id: number;
  proposer: string;
  description: string;
  title: string;
  status: ProposalState;
  startBlock: number;
  endBlock: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  canceled: boolean;
  executed: boolean;
  votes?: Vote[];
  privateVotes?: PrivateVote[];
  currentBlock?: number;
  quorum?: number;
  category?: string;
  dateCreated?: number;
  executionData?: any;
}

/**
 * Delegation data structure
 */
export interface Delegation {
  delegator: string;
  delegatee: string;
  votingPower: number;
  timestamp: number;
  active: boolean;
}

/**
 * User statistics for leaderboard
 */
export interface UserStats {
  address: string;
  displayName?: string;
  profileImage?: string;
  totalVotes: number;
  proposalsCreated: number;
  proposalsVoted: number;
  lastActive: number;
  level: number;
  points: number;
}

/**
 * Activity record for the activity feed
 */
export interface ActivityRecord {
  id: string;
  type: 'vote' | 'proposal' | 'delegation' | 'execution' | 'claim';
  timestamp: number;
  userAddress: string;
  displayName?: string;
  proposalId?: number; 
  proposalTitle?: string;
  vote?: number;
  votingPower?: number;
  delegatee?: string;
  message?: string;
}

/**
 * Notification structure
 */
export interface Notification {
  id: string;
  userId: string;
  type: 'proposal' | 'vote' | 'delegation' | 'execution' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  link?: string;
  proposalId?: number;
} 