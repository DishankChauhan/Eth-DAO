/**
 * Proposal state enum from the contract
 */
export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}

/**
 * Support values for voting
 */
export enum VoteSupport {
  Against = 0,
  For = 1,
  Abstain = 2
}

/**
 * Proposal category types for better organization
 */
export enum ProposalCategory {
  Governance = 'governance',
  Treasury = 'treasury',
  Development = 'development',
  Community = 'community',
  Other = 'other'
}

/**
 * Interface for proposal metadata
 */
export interface ProposalMetadata {
  title: string;
  description: string;
  category?: ProposalCategory;
  executionData?: {
    functionName: string;
    parameters: any[];
    target: string;
    value: string;
  };
}

/**
 * Interface for proposal parameters
 */
export interface ProposalParameters {
  targets: string[];
  values: number[] | string[];
  calldatas: string[];
  description: string;
  title?: string;
  category?: ProposalCategory;
}

/**
 * Core proposal data structure
 */
export interface ProposalCore {
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
  quorum?: number;
  category?: string;
  dateCreated?: number;
  executionData?: any;
} 