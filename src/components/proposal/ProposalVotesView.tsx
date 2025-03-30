'use client';
import { useState, useEffect } from 'react';
import { Vote, PrivateVote } from '@/types/firebase';
import { VoteSupport } from '@/types/proposal';
import { getVoters } from '@/services/contractService';
import { truncateAddress } from '@/utils/address';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Hand, 
  Shield, 
  SlidersHorizontal, 
  ArrowUpDown,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import logger from '@/utils/logger';

interface ProposalVotesViewProps {
  proposalId: number;
  className?: string;
}

export default function ProposalVotesView({ proposalId, className = '' }: ProposalVotesViewProps) {
  const [votes, setVotes] = useState<Array<Vote | PrivateVote>>([]);
  const [filteredVotes, setFilteredVotes] = useState<Array<Vote | PrivateVote>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'for' | 'against' | 'abstain'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'time'>('votes');
  const [searchValue, setSearchValue] = useState('');
  
  useEffect(() => {
    if (!proposalId) return;
    
    const fetchVotes = async () => {
      setLoading(true);
      try {
        logger.debug(`Fetching votes for proposal ${proposalId}`);
        const votersData = await getVoters(proposalId);
        setVotes(votersData);
        setFilteredVotes(votersData);
        setError(null);
      } catch (err) {
        logger.error('Error fetching voters:', err);
        setError('Failed to load votes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVotes();
  }, [proposalId]);
  
  useEffect(() => {
    let filtered = [...votes];
    
    // Apply vote type filter
    if (filter !== 'all') {
      filtered = filtered.filter(vote => {
        if (filter === 'for') return vote.support === VoteSupport.For;
        if (filter === 'against') return vote.support === VoteSupport.Against;
        if (filter === 'abstain') return vote.support === VoteSupport.Abstain;
        return true;
      });
    }
    
    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(vote => {
        // If vote has voter property (standard vote)
        if ('voter' in vote) {
          return vote.voter.toLowerCase().includes(searchValue.toLowerCase());
        }
        return false;
      });
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else {
        return b.timestamp - a.timestamp;
      }
    });
    
    setFilteredVotes(filtered);
  }, [votes, filter, sortBy, searchValue]);
  
  const refreshVotes = async () => {
    if (!proposalId) return;
    
    setLoading(true);
    try {
      logger.debug(`Refreshing votes for proposal ${proposalId}`);
      const votersData = await getVoters(proposalId);
      setVotes(votersData);
      setFilteredVotes(votersData);
      setError(null);
    } catch (err) {
      logger.error('Error refreshing voters:', err);
      setError('Failed to refresh votes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const totalPower = votes.reduce((sum, vote) => sum + vote.votes, 0);
  
  const getVoteTypeIcon = (support: number) => {
    switch (support) {
      case VoteSupport.For:
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case VoteSupport.Against:
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case VoteSupport.Abstain:
        return <Hand className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Votes</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshVotes} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Badge variant="outline">
            {votes.length} Vote{votes.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="text-center py-4 text-red-500">
            {error}
            <Button 
              variant="link" 
              size="sm" 
              onClick={refreshVotes} 
              className="text-blue-400 ml-2"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    className="pl-8 pr-4 py-2 w-full rounded-md border bg-background"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSortBy(sortBy === 'votes' ? 'time' : 'votes')}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  {sortBy === 'votes' ? 'By Power' : 'By Time'}
                </Button>
              </div>
              
              <Tabs defaultValue="all" value={filter} onValueChange={(val: any) => setFilter(val)}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="for" className="text-green-500">For</TabsTrigger>
                  <TabsTrigger value="against" className="text-red-500">Against</TabsTrigger>
                  <TabsTrigger value="abstain" className="text-yellow-500">Abstain</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {loading ? (
              <div className="py-8 text-center flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-gray-500" />
                <span className="text-muted-foreground">Loading votes...</span>
              </div>
            ) : filteredVotes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {votes.length > 0 
                  ? 'No votes match your filters'
                  : 'No votes found for this proposal'
                }
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredVotes.map((vote, index) => {
                  const isPrivateVote = 'isPrivate' in vote && vote.isPrivate;
                  const voterAddress = 'voter' in vote ? vote.voter : 'Private Vote';
                  
                  return (
                    <div 
                      key={isPrivateVote ? `private-${index}` : voterAddress}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        {isPrivateVote ? (
                          <Avatar className="h-8 w-8 bg-gray-100">
                            <AvatarFallback>
                              <Shield className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://effigy.im/a/${voterAddress}.svg`} />
                            <AvatarFallback>
                              {voterAddress.substring(2, 4).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div>
                          <div className="font-medium">
                            {isPrivateVote ? (
                              <span className="flex items-center">
                                Private Vote 
                                <Shield className="h-3 w-3 ml-1" />
                              </span>
                            ) : (
                              truncateAddress(voterAddress)
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {vote.timestamp > 0 ? (
                              formatDistanceToNow(new Date(vote.timestamp), { addSuffix: true })
                            ) : (
                              'No timestamp'
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            vote.support === VoteSupport.For 
                              ? 'success' 
                              : vote.support === VoteSupport.Against 
                                ? 'destructive' 
                                : 'outline'
                          }
                          className="flex items-center"
                        >
                          {getVoteTypeIcon(vote.support)}
                          <span className="ml-1">
                            {vote.support === VoteSupport.For 
                              ? 'For' 
                              : vote.support === VoteSupport.Against 
                                ? 'Against' 
                                : 'Abstain'
                            }
                          </span>
                        </Badge>
                        
                        <Badge variant="secondary">
                          {vote.votes.toLocaleString()} Vote{vote.votes !== 1 ? 's' : ''}
                        </Badge>
                        
                        {totalPower > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {((vote.votes / totalPower) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 