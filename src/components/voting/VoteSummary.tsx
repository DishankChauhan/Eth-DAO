'use client';

import React, { useState, useEffect } from 'react';
import { VoteSummary as VoteSummaryType, getVoteSummary } from '@/services/aiSummaryService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, RefreshCw, Zap, Brain, Lightbulb, Waves as Whale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface VoteSummaryProps {
  proposalId: number;
  className?: string;
}

export default function VoteSummary({ proposalId, className = '' }: VoteSummaryProps) {
  const [summary, setSummary] = useState<VoteSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchSummary();
  }, [proposalId]);

  const fetchSummary = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const summaryData = await getVoteSummary(proposalId, forceRefresh);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching vote summary:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSummary(true);
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle no summary
  if (!summary) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Vote Summary Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn't generate a summary for this proposal. This could be due to no voting activity or a technical issue.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Vote Analysis</span>
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Intelligent analysis of voting patterns and trends
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg border border-muted">
          <p className="text-sm">{summary.summary}</p>
        </div>

        {/* Voting trends */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Voting Trends</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>For ({summary.votingTrends.forPercentage.toFixed(1)}%)</span>
                <span>{summary.votingTrends.totalVotes > 0 ? Math.round(summary.votingTrends.forPercentage / 100 * summary.votingTrends.totalVotes) : 0} votes</span>
              </div>
              <Progress 
                value={summary.votingTrends.forPercentage} 
                className="h-2 bg-muted" 
                style={{ "--progress-foreground": "hsl(142 76% 36%)" } as React.CSSProperties} 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Against ({summary.votingTrends.againstPercentage.toFixed(1)}%)</span>
                <span>{summary.votingTrends.totalVotes > 0 ? Math.round(summary.votingTrends.againstPercentage / 100 * summary.votingTrends.totalVotes) : 0} votes</span>
              </div>
              <Progress 
                value={summary.votingTrends.againstPercentage} 
                className="h-2 bg-muted" 
                style={{ "--progress-foreground": "hsl(0 84% 60%)" } as React.CSSProperties} 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Abstain ({summary.votingTrends.abstainPercentage.toFixed(1)}%)</span>
                <span>{summary.votingTrends.totalVotes > 0 ? Math.round(summary.votingTrends.abstainPercentage / 100 * summary.votingTrends.totalVotes) : 0} votes</span>
              </div>
              <Progress 
                value={summary.votingTrends.abstainPercentage} 
                className="h-2 bg-muted" 
                style={{ "--progress-foreground": "hsl(220 9% 46%)" } as React.CSSProperties} 
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            {summary.votingTrends.quorumReached && (
              <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500">
                Quorum Reached
              </Badge>
            )}
            {summary.votingTrends.majorityReached && (
              <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500">
                Majority Support
              </Badge>
            )}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Key Insights</span>
          </h3>

          <ul className="space-y-2">
            {summary.insights.map((insight, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Whale activity */}
        {summary.whaleActivity.largestVoters.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Whale className="h-4 w-4 text-blue-500" />
              <span>Whale Activity</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-xs text-muted-foreground ml-1">(i)</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Whales are users with significant voting power who can influence outcomes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>

            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">
                Top voters control <span className="font-medium text-primary">{summary.whaleActivity.whaleInfluence.toFixed(1)}%</span> of voting power
              </div>

              <div className="space-y-2">
                {summary.whaleActivity.largestVoters.map((voter, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono">{voter.address.slice(0, 6)}...{voter.address.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={voter.voteType === 'For' 
                          ? 'border-green-500 text-green-400' 
                          : voter.voteType === 'Against' 
                            ? 'border-red-500 text-red-400' 
                            : 'border-gray-500 text-gray-400'
                        }
                      >
                        {voter.voteType}
                      </Badge>
                      <span className="font-medium">{voter.votingPower.toFixed(2)} votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        Last updated {formatTime(summary.lastUpdated)}
      </CardFooter>
    </Card>
  );
} 