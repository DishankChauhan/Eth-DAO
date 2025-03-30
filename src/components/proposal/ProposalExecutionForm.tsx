'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProposalState } from '@/types/proposal';
import { executeProposal } from '@/services/contractService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProposalExecutionFormProps {
  proposalId: number;
  proposalState: ProposalState;
  className?: string;
  onSuccess?: () => void;
}

export default function ProposalExecutionForm({
  proposalId,
  proposalState,
  className = '',
  onSuccess
}: ProposalExecutionFormProps) {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  
  const canExecute = proposalState === ProposalState.Succeeded;
  const isExecuted = proposalState === ProposalState.Executed;
  
  const handleExecute = async () => {
    if (!canExecute) {
      toast.error('This proposal cannot be executed');
      return;
    }
    
    try {
      setIsExecuting(true);
      
      await executeProposal(proposalId);
      
      toast.success('Proposal executed successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Refresh the page to show the updated state
      router.refresh();
    } catch (error) {
      console.error('Error executing proposal:', error);
      toast.error('Failed to execute proposal. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (isExecuted) {
    return (
      <Card className={`bg-green-900/20 border-green-500/50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-green-400">
            <CheckCircle className="h-8 w-8 mr-2" />
            <p className="text-lg font-medium">This proposal has been executed</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!canExecute) {
    return null;
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Execute Proposal</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="bg-amber-900/20 border border-amber-500/50 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-amber-300">
              <p className="font-medium">This proposal is ready to be executed</p>
              <p className="mt-1">Executing this proposal will implement the changes described in the proposal on-chain.</p>
            </div>
          </div>
        </div>
        
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Execute Proposal
            </>
          )}
        </Button>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <div className="w-full text-center">
          <p>Note: Gas fees will apply to execute this proposal</p>
        </div>
      </CardFooter>
    </Card>
  );
} 