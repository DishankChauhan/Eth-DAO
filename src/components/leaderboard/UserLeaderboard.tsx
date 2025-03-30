'use client';

import React, { useState, useEffect } from 'react';
import { UserStats } from '@/types/firebase';
import { getLeaderboard } from '@/services/activityService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, Vote, CheckCircle2, Users, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserLeaderboardProps {
  limit?: number;
  className?: string;
}

export default function UserLeaderboard({ limit = 10, className = '' }: UserLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const leaderboardData = await getLeaderboard(limit);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  // Get medal icon by rank
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case 2:
        return <Trophy className="h-5 w-5 text-slate-300" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get level badge text and color
  const getLevelBadge = (level: number) => {
    let variant = "default";
    let label = `Level ${level}`;
    
    if (level >= 6) {
      variant = "destructive";
    } else if (level >= 4) {
      variant = "secondary";
    }
    
    return (
      <Badge variant={variant as "default" | "secondary" | "destructive" | "outline"}>
        {label}
      </Badge>
    );
  };

  // Format time
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
            <Skeleton className="h-7 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span>Community Leaderboard</span>
        </CardTitle>
        <CardDescription>
          Top contributors in the DAO governance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leaderboard data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((user, index) => (
                <TableRow key={user.address}>
                  <TableCell>
                    <div className="flex justify-center">{getMedalIcon(index + 1)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage 
                          src={user.profileImage || `https://effigy.im/a/${user.address}.svg`} 
                          alt={user.displayName || user.address} 
                        />
                        <AvatarFallback>
                          {user.displayName?.slice(0, 2) || user.address.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user.displayName || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Active {formatTime(user.lastActive)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLevelBadge(user.level)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1" title="Proposals Created">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        <span className="text-xs">{user.proposalsCreated}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Votes Cast">
                        <Vote className="h-4 w-4 text-blue-500" />
                        <span className="text-xs">{user.proposalsVoted}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Delegations">
                        <Users className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs">0</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {user.points.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 