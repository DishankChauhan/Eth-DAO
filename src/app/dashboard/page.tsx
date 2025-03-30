import React from 'react';
import { Metadata } from 'next';
import ActivityFeed from '@/components/activity/ActivityFeed';
import UserLeaderboard from '@/components/leaderboard/UserLeaderboard';
import VoteSummary from '@/components/voting/VoteSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, Trophy, CheckSquare, CircleUser, List, PieChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DAO Dashboard | ETH Voting App',
  description: 'Analytics dashboard for the DAO governance platform',
};

export default function DashboardPage() {
  // For demo purposes, select a fixed proposal ID
  const demoProposalId = 1;

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Governance Dashboard</h1>
        <p className="text-muted-foreground">Monitor governance activity, view leaderboards, and analyze voting trends</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {/* Stats cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 proposals ending soon</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Voters</CardTitle>
              <CircleUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">483</div>
              <p className="text-xs text-muted-foreground">+27 this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground">67% participation rate</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="activity" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="activity" className="flex gap-2 items-center">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex gap-2 items-center">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex gap-2 items-center">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Proposals</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex gap-2 items-center">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <div className="grid gap-6 md:grid-cols-5">
              <div className="md:col-span-3">
                <ActivityFeed limit={15} />
              </div>
              <div className="md:col-span-2">
                <VoteSummary proposalId={demoProposalId} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <UserLeaderboard limit={10} />
          </TabsContent>
          
          <TabsContent value="proposals">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Proposal List View</h3>
                <p>This section would display a filterable list of all proposals.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Voting Analytics</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <p>This would display vote distribution charts</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Participation Trends</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <p>This would display participation trend graphs</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 