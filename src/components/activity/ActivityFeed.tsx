'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ActivityType, getActivityFeed } from '@/services/activityService';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, MessageSquare, Users, Vote } from 'lucide-react';

interface ActivityFeedProps {
  userAddress?: string;
  limit?: number;
  className?: string;
}

export default function ActivityFeed({ userAddress, limit = 10, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const activityData = await getActivityFeed(limit, userAddress);
        setActivities(activityData);
        setFilteredActivities(activityData);
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [limit, userAddress]);

  // Filter activities when tab changes
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity => {
        switch (activeTab) {
          case "votes":
            return activity.type === ActivityType.VOTE_CAST;
          case "proposals":
            return activity.type === ActivityType.PROPOSAL_CREATED || 
                   activity.type === ActivityType.PROPOSAL_EXECUTED;
          case "social":
            return activity.type === ActivityType.COMMENT_ADDED || 
                   activity.type === ActivityType.DELEGATION;
          default:
            return true;
        }
      });
      setFilteredActivities(filtered);
    }
  }, [activeTab, activities]);

  // Get activity icon based on type
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.VOTE_CAST:
        return <Vote className="h-5 w-5 text-blue-500" />;
      case ActivityType.PROPOSAL_CREATED:
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      case ActivityType.PROPOSAL_EXECUTED:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case ActivityType.DELEGATION:
        return <Users className="h-5 w-5 text-yellow-500" />;
      case ActivityType.COMMENT_ADDED:
        return <MessageSquare className="h-5 w-5 text-pink-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get badge color based on activity type
  const getBadgeVariant = (type: ActivityType): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case ActivityType.VOTE_CAST:
        return "default";
      case ActivityType.PROPOSAL_CREATED:
        return "secondary";
      case ActivityType.PROPOSAL_EXECUTED:
        return "destructive";
      case ActivityType.DELEGATION:
        return "outline";
      default:
        return "default";
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  // Get activity type label
  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case ActivityType.VOTE_CAST:
        return "Voted";
      case ActivityType.PROPOSAL_CREATED:
        return "Created Proposal";
      case ActivityType.PROPOSAL_EXECUTED:
        return "Executed Proposal";
      case ActivityType.DELEGATION:
        return "Delegated Votes";
      case ActivityType.COMMENT_ADDED:
        return "Commented";
      case ActivityType.TOKENS_CLAIMED:
        return "Claimed Tokens";
      default:
        return type;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent governance activity in the DAO</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="votes">Votes</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-2">
            {isLoading ? (
              <div className="space-y-4 mt-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities found
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage 
                        src={`https://effigy.im/a/${activity.userAddress}.svg`} 
                        alt={activity.userName || activity.userAddress} 
                      />
                      <AvatarFallback>
                        {activity.userName?.slice(0, 2) || activity.userAddress.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">
                          {activity.userName || `${activity.userAddress.slice(0, 6)}...${activity.userAddress.slice(-4)}`}
                        </p>
                        <Badge variant={getBadgeVariant(activity.type)}>
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      
                      {activity.proposalTitle && (
                        <div className="mt-1 text-xs p-2 rounded bg-muted">
                          {activity.proposalTitle}
                        </div>
                      )}
                      
                      {activity.points && (
                        <div className="mt-1 text-xs text-emerald-500">
                          +{activity.points} points
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
} 