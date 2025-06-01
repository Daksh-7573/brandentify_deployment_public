import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NowboardMenuProps {
  itemId: number;
  userId: number;
  currentUserId: number;
  onDeleted?: () => void;
}

export function NowboardMenu({ itemId, userId, currentUserId, onDeleted }: NowboardMenuProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  const isCreator = userId === currentUserId;

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/nowboard-items/${itemId}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Nowboard item deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nowboard-items'] });
      onDeleted?.();
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete nowboard item.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    },
  });

  const flagMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/nowboard-items/${itemId}/flag`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Nowboard item flagged successfully. Our team will review it.",
      });
      setShowFlagDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to flag nowboard item.",
        variant: "destructive",
      });
      setShowFlagDialog(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleFlag = () => {
    flagMutation.mutate();
  };

  return (
    <div className="flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-white/10 focus:bg-white/10 data-[state=open]:bg-white/10 text-white"
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff'
            }}
          >
            <MoreHorizontal className="h-4 w-4" style={{ color: '#ffffff' }} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="neo-glass-panel border-0 min-w-[160px] p-2"
          style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', backdropFilter: 'blur(15px)' }}
        >
          {isCreator ? (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)} 
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold flex items-center hover:bg-red-500/30"
              style={{ 
                color: '#ff6b6b'
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" style={{ color: '#ff6b6b' }} />
              <span style={{ color: '#ff6b6b' }}>Delete Item</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowFlagDialog(true)}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold flex items-center hover:bg-white/20"
              style={{ 
                color: '#ffffff'
              }}
            >
              <Flag className="mr-2 h-4 w-4" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Flag Item</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="neo-glass-panel border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Nowboard Item</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Are you sure you want to delete this nowboard item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="neo-glass-button border-white/20 text-white hover:bg-white/10"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 hover:text-red-200"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag confirmation dialog */}
      <AlertDialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <AlertDialogContent className="neo-glass-panel border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Flag Nowboard Item</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Are you sure you want to flag this nowboard item as inappropriate? Our team will review it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="neo-glass-button border-white/20 text-white hover:bg-white/10"
              disabled={flagMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFlag}
              disabled={flagMutation.isPending}
              className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30 hover:text-orange-200"
            >
              {flagMutation.isPending ? 'Flagging...' : 'Flag Item'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}