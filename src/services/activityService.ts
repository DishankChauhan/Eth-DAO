import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp, doc, getDoc, setDoc, updateDoc, limit as firestoreLimit } from 'firebase/firestore';
import { getAddress } from 'ethers';
import logger from '@/utils/logger';
import { ActivityRecord, UserStats } from '@/types/firebase';
import { v4 as uuidv4 } from 'uuid';

// Activity types
export enum ActivityType {
  VOTE_CAST = 'vote_cast',
  PROPOSAL_CREATED = 'proposal_created',
  PROPOSAL_EXECUTED = 'proposal_executed',
  DELEGATION = 'delegation',
  TOKENS_CLAIMED = 'tokens_claimed',
  COMMENT_ADDED = 'comment_added'
}

// Activity interface
export interface Activity {
  id?: string;
  type: ActivityType;
  userId: string;
  userAddress: string;
  userName?: string;
  proposalId?: number;
  proposalTitle?: string;
  targetId?: string;
  targetAddress?: string;
  targetName?: string;
  description: string;
  value?: number;
  points?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Record a new activity in the activity feed
 * @param activity The activity to record
 */
export const recordActivity = async (activity: Omit<Activity, 'timestamp'>): Promise<string | null> => {
  try {
    logger.debug('Recording activity', { type: activity.type });
    
    // Format addresses
    let userAddress = activity.userAddress;
    try {
      userAddress = getAddress(activity.userAddress);
    } catch (error) {
      logger.warn('Invalid user address format', { address: activity.userAddress });
    }
    
    const timestamp = Date.now();
    
    // Add points based on activity type
    const points = calculateActivityPoints(activity.type);
    
    // Create the activity document
    const activityDoc = {
      ...activity,
      userAddress,
      timestamp,
      points
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'activities'), activityDoc);
    
    // Map ActivityType to ActivityRecord type
    const mapActivityType = (type: ActivityType): 'vote' | 'proposal' | 'delegation' | 'execution' | 'claim' => {
      switch (type) {
        case ActivityType.VOTE_CAST:
          return 'vote';
        case ActivityType.PROPOSAL_CREATED:
          return 'proposal';
        case ActivityType.PROPOSAL_EXECUTED:
          return 'execution';
        case ActivityType.DELEGATION:
          return 'delegation';
        case ActivityType.TOKENS_CLAIMED:
          return 'claim';
        default:
          return 'vote'; // default fallback
      }
    };

    // Update user stats
    await _updateUserStatsInternal(activity.userAddress, mapActivityType(activity.type), points);
    
    logger.debug('Activity recorded successfully', { id: docRef.id });
    return docRef.id;
  } catch (error) {
    logger.error('Error recording activity', error);
    return null;
  }
};

/**
 * Calculate points for an activity
 */
const calculateActivityPoints = (activityType: ActivityType): number => {
  // Point values for different activities
  switch (activityType) {
    case ActivityType.PROPOSAL_CREATED:
      return 100;
    case ActivityType.VOTE_CAST:
      return 20;
    case ActivityType.PROPOSAL_EXECUTED:
      return 50;
    case ActivityType.DELEGATION:
      return 30;
    case ActivityType.TOKENS_CLAIMED:
      return 10;
    case ActivityType.COMMENT_ADDED:
      return 5;
    default:
      return 1;
  }
};

/**
 * Update user stats when a new activity is recorded
 */
const _updateUserStatsInternal = async (
  userAddress: string,
  activityType: 'vote' | 'proposal' | 'delegation' | 'execution' | 'claim',
  points: number
): Promise<void> => {
  try {
    const userStatsRef = doc(db, 'userStats', userAddress.toLowerCase());
    const userStatsSnap = await getDoc(userStatsRef);
    
    // Default stats if user doesn't exist
    const defaultStats: UserStats = {
      address: userAddress.toLowerCase(),
      proposalsCreated: 0,
      proposalsVoted: 0,
      totalVotes: 0,
      lastActive: Date.now(),
      level: 1,
      points: 0
    };
    
    // Current stats or default
    const currentStats = userStatsSnap.exists() ? userStatsSnap.data() as UserStats : defaultStats;
    
    // Update stats based on activity type
    const updatedStats = { ...currentStats, lastActive: Date.now(), points: currentStats.points + points };
    
    if (activityType === 'proposal') {
      updatedStats.proposalsCreated += 1;
    } else if (activityType === 'vote') {
      updatedStats.proposalsVoted += 1;
      updatedStats.totalVotes = (updatedStats.totalVotes || 0) + 1;
    } else if (activityType === 'delegation') {
      // Delegation handling would be more complex in a real application
      // This is a simplified version
    }
    
    // Calculate user level based on total points
    updatedStats.level = calculateUserLevel(updatedStats.points);
    
    // Save updated stats - using proper Firebase v9 method
    await setDoc(userStatsRef, updatedStats, { merge: true });
    
    logger.debug('User stats updated', { address: userAddress, points, newTotal: updatedStats.points });
  } catch (error) {
    logger.error('Error updating user stats', error);
  }
};

/**
 * Calculate user level based on points
 */
const calculateUserLevel = (points: number): number => {
  // Simple level calculation
  // Level 1: 0-99 points
  // Level 2: 100-299 points
  // Level 3: 300-699 points
  // Level 4: 700-1499 points
  // Level 5: 1500-2999 points
  // Level 6: 3000+ points
  
  if (points < 100) return 1;
  if (points < 300) return 2;
  if (points < 700) return 3;
  if (points < 1500) return 4;
  if (points < 3000) return 5;
  return 6;
};

/**
 * Get recent activity feed
 * @param limit The maximum number of items to fetch
 * @param userAddress Optional user address to filter activities
 */
export const getActivityFeed = async (
  itemLimit: number = 20,
  userAddress?: string
): Promise<Activity[]> => {
  try {
    logger.debug('Fetching activity feed', { limit: itemLimit, userAddress });
    
    let activityQuery = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(itemLimit)
    );
    
    // If user address is provided, filter by it
    if (userAddress) {
      activityQuery = query(
        collection(db, 'activities'),
        where('userAddress', '==', userAddress.toLowerCase()),
        orderBy('timestamp', 'desc'),
        limit(itemLimit)
      );
    }
    
    const querySnapshot = await getDocs(activityQuery);
    const activities: Activity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data() as Omit<Activity, 'id'>
      });
    });
    
    logger.debug('Activity feed fetched', { count: activities.length });
    return activities;
  } catch (error) {
    logger.error('Error fetching activity feed', error);
    return [];
  }
};

/**
 * Get user leaderboard
 * @param limit The maximum number of users to fetch
 */
export const getLeaderboardLegacy = async (itemLimit: number = 10): Promise<UserStats[]> => {
  try {
    logger.debug('Fetching leaderboard', { limit: itemLimit });
    
    const leaderboardQuery = query(
      collection(db, 'userStats'),
      orderBy('points', 'desc'),
      firestoreLimit(itemLimit)
    );
    
    const querySnapshot = await getDocs(leaderboardQuery);
    const leaderboard: UserStats[] = [];
    
    querySnapshot.forEach((doc) => {
      leaderboard.push(doc.data() as UserStats);
    });
    
    logger.debug('Leaderboard fetched', { count: leaderboard.length });
    return leaderboard;
  } catch (error) {
    logger.error('Error fetching leaderboard', error);
    return [];
  }
};

/**
 * Get a user's activity stats
 * @param userAddress The user's address
 */
export const getUserStats = async (userAddress: string): Promise<UserStats | null> => {
  try {
    logger.debug('Fetching user stats', { userAddress });
    
    const userStatsRef = doc(db, 'userStats', userAddress.toLowerCase());
    const userStatsSnap = await getDoc(userStatsRef);
    
    if (!userStatsSnap.exists()) {
      logger.debug('No stats found for user', { userAddress });
      return null;
    }
    
    const stats = userStatsSnap.data() as UserStats;
    logger.debug('User stats fetched', { address: userAddress });
    return stats;
  } catch (error) {
    logger.error('Error fetching user stats', error);
    return null;
  }
};

/**
 * Add an activity record
 * @param activity The activity data
 * @returns The created activity ID
 */
export const addActivity = async (activity: Omit<ActivityRecord, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const activityId = uuidv4();
    
    const activityData: ActivityRecord = {
      id: activityId,
      userAddress: activity.userAddress,
      type: activity.type,
      timestamp: Date.now(),
      displayName: activity.displayName,
      proposalId: activity.proposalId,
      proposalTitle: activity.proposalTitle,
      vote: activity.vote,
      votingPower: activity.votingPower,
      delegatee: activity.delegatee,
      message: activity.message
    };
    
    await addDoc(collection(db, 'activities'), activityData);
    
    logger.debug('Added activity record:', { 
      id: activityId, 
      userAddress: activity.userAddress,
      type: activity.type  
    });
    
    return activityId;
  } catch (error) {
    logger.error('Error adding activity record:', error);
    throw error;
  }
};

/**
 * Get recent activity
 * @param options Query options (limit, types)
 * @returns An array of activity records
 */
export const getRecentActivity = async (
  options: { limit?: number; types?: string[]; userAddress?: string } = {}
): Promise<ActivityRecord[]> => {
  try {
    logger.debug('Getting recent activity');
    
    const activitiesRef = collection(db, 'activities');
    let activitiesQuery = query(
      activitiesRef,
      orderBy('timestamp', 'desc')
    );
    
    // Apply additional filters if provided
    if (options.types && options.types.length > 0) {
      activitiesQuery = query(
        activitiesQuery,
        where('type', 'in', options.types)
      );
    }
    
    if (options.userAddress) {
      activitiesQuery = query(
        activitiesQuery,
        where('userAddress', '==', options.userAddress)
      );
    }
    
    if (options.limit) {
      activitiesQuery = query(
        activitiesQuery,
        limit(options.limit)
      );
    }
    
    const querySnapshot = await getDocs(activitiesQuery);
    
    const activities: ActivityRecord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ActivityRecord;
      activities.push({
        ...data,
        id: doc.id
      });
    });
    
    logger.debug(`Found ${activities.length} activity records`);
    return activities;
  } catch (error) {
    logger.error('Error getting recent activity:', error);
    throw error;
  }
};

/**
 * Update user statistics based on activity
 * @param userAddress The user's address
 * @param activityType The type of activity
 * @param data Additional data related to the activity
 */
export const updateUserStats = async (
  userAddress: string, 
  activityType: 'vote' | 'proposal' | 'delegation' | 'execution' | 'claim',
  data: any = {}
): Promise<void> => {
  try {
    logger.debug(`Updating user stats for ${userAddress} after ${activityType}`);
    
    // Get existing user stats or create new
    const userStatsRef = doc(db, 'userStats', userAddress.toLowerCase());
    const userStatsDoc = await getDoc(userStatsRef);
    
    let stats: UserStats;
    
    if (userStatsDoc.exists()) {
      stats = userStatsDoc.data() as UserStats;
    } else {
      // Initialize default stats
      stats = {
        address: userAddress.toLowerCase(),
        totalVotes: 0,
        proposalsCreated: 0,
        proposalsVoted: 0,
        lastActive: Date.now(),
        level: 1,
        points: 0
      };
    }
    
    // Update stats based on activity type
    switch (activityType) {
      case 'vote':
        stats.totalVotes += 1;
        stats.proposalsVoted += 1;
        stats.points += 10; // 10 points for voting
        break;
      case 'proposal':
        stats.proposalsCreated += 1;
        stats.points += 50; // 50 points for creating a proposal
        break;
      case 'delegation':
        stats.points += 5; // 5 points for delegation activity
        break;
      case 'execution':
        stats.points += 30; // 30 points for executing a proposal
        break;
      case 'claim':
        stats.points += 15; // 15 points for claiming rewards or tokens
        break;
    }
    
    // Update last active timestamp
    stats.lastActive = Date.now();
    
    // Calculate level based on points (1 level per 100 points)
    stats.level = Math.max(1, Math.floor(stats.points / 100) + 1);
    
    // Save updated stats
    await setDoc(userStatsRef, stats);
    
    // Add activity record
    await addActivity({
      userAddress: userAddress.toLowerCase(),
      type: activityType,
      ...data
    });
    
    logger.debug(`Updated stats for ${userAddress}:`, {
      level: stats.level,
      points: stats.points
    });
  } catch (error) {
    logger.error('Error updating user stats:', error);
    // Don't throw here to prevent breaking main functionality
  }
};

/**
 * Get top users from the leaderboard
 * @param limit Maximum number of users to return
 * @returns Array of user stats sorted by points
 */
export const getLeaderboard = async (limit = 10): Promise<UserStats[]> => {
  try {
    logger.debug(`Getting leaderboard (top ${limit} users)`);
    
    const userStatsRef = collection(db, 'userStats');
    const leaderboardQuery = query(
      userStatsRef,
      orderBy('points', 'desc'),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(leaderboardQuery);
    
    const leaderboard: UserStats[] = [];
    let rank = 1;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserStats;
      leaderboard.push({
        ...data,
        rank
      } as UserStats);
      rank++;
    });
    
    logger.debug(`Retrieved ${leaderboard.length} users for leaderboard`);
    return leaderboard;
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    throw error;
  }
}; 