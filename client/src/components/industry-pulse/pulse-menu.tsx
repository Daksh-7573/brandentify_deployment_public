import { useState, useEffect } from "react";
import { MoreHorizontal, Trash2, Flag, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PulseMenuProps {
  pulseId: number;
  currentUserId: number;
  pulseCreatorId: number;
}

export default function PulseMenu({ pulseId, currentUserId, pulseCreatorId }: PulseMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagDescription, setFlagDescription] = useState("");
  
  // Check if user has already flagged this pulse
  const { data: flagStatus, refetch: refetchFlagStatus } = useQuery({
    queryKey: ['/api/pulses', pulseId, 'flag-status', currentUserId],
    queryFn: async () => {
      const res = await fetch(`/api/pulses/${pulseId}/flag-status/${currentUserId}`);
      const data = await res.json();
      console.log(`[Flag Status Query] Pulse ${pulseId}, User ${currentUserId}: hasFlag=${data?.hasFlag}`);
      return data;
    },
    enabled: currentUserId !== pulseCreatorId, // Enable for non-creators
  });
  
  // Refetch flag status when dropdown opens
  const handleDropdownOpenChange = (open: boolean) => {
    setShowDropdown(open);
    if (open && currentUserId !== pulseCreatorId) {
      console.log(`[Flag Menu] Dropdown opened for pulse ${pulseId}, refetching flag status...`);
      refetchFlagStatus();
    }
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isCreator = currentUserId === pulseCreatorId;
  
  // Delete pulse mutation
  const deletePulseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/pulses/${pulseId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
      toast({
        title: "Pulse deleted",
        description: "Your pulse has been successfully deleted.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete pulse",
        description: "There was an error deleting your pulse. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Flag pulse mutation
  const flagPulseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/pulses/${pulseId}/flag`, {
        userId: currentUserId,
        reason: flagReason,
        description: flagDescription,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the flag status query so it refreshes
      queryClient.invalidateQueries({ queryKey: ['/api/pulses', pulseId, 'flag-status', currentUserId] });
      toast({
        title: "Pulse flagged",
        description: "Thank you for reporting this content. We'll review it shortly.",
      });
      setShowFlagDialog(false);
      setFlagReason("");
      setFlagDescription("");
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.status === 409 ? "You already flagged this pulse" : "There was an error reporting this content. Please try again.";
      toast({
        title: "Failed to flag pulse",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = () => {
    deletePulseMutation.mutate();
  };
  
  const handleFlag = () => {
    if (!flagReason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for flagging this content.",
        variant: "destructive",
      });
      return;
    }
    flagPulseMutation.mutate();
  };
  
  const flagReasons = [
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "misinformation", label: "False information" },
    { value: "copyright", label: "Copyright violation" },
    { value: "other", label: "Other" },
  ];
  
  return (
    <>
      <DropdownMenu open={showDropdown} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
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
                color: '#ff6b6b !important'
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" style={{ color: '#ff6b6b' }} />
              <span style={{ color: '#ff6b6b' }}>Delete Pulse</span>
            </DropdownMenuItem>
          ) : flagStatus?.hasFlag ? (
            <DropdownMenuItem 
              disabled
              className="rounded-md px-3 py-2 text-sm font-semibold flex items-center opacity-60"
              style={{ 
                color: '#4ade80 !important'
              }}
            >
              <Check className="mr-2 h-4 w-4" style={{ color: '#4ade80' }} />
              <span style={{ color: '#4ade80' }}>Already flagged</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => {
                setShowFlagDialog(true);
                setShowDropdown(false);
              }}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold flex items-center hover:bg-white/20"
              style={{ 
                color: '#ffffff !important'
              }}
            >
              <Flag className="mr-2 h-4 w-4" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Flag Pulse</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="neo-glass-panel border-0 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-lg font-semibold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70 text-sm">
              This action cannot be undone. This will permanently delete your pulse and remove it from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-6">
            <AlertDialogCancel className="neo-glass-button secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-red-400/50"
              disabled={deletePulseMutation.isPending}
            >
              {deletePulseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="neo-glass-panel border border-white/10 text-white w-[90vw] max-w-sm p-4 gap-3 max-h-[90vh] flex flex-col !top-12 !translate-y-0 !left-1/2 !-translate-x-1/2">
          <DialogHeader className="space-y-1 p-0">
            <DialogTitle className="text-white text-base font-semibold">Flag Pulse</DialogTitle>
            <DialogDescription className="text-white/70 text-xs">
              Why is this content inappropriate?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            <Label className="text-white text-xs font-medium">Select reason</Label>
            <RadioGroup value={flagReason} onValueChange={setFlagReason} className="space-y-1">
              {flagReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={reason.value} 
                    id={reason.value} 
                    className="border-white/30 text-white data-[state=checked]:bg-white/20 data-[state=checked]:border-white"
                  />
                  <Label htmlFor={reason.value} className="text-white/80 text-xs cursor-pointer flex-1">{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white text-xs font-medium">Details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details..."
              value={flagDescription}
              onChange={(e) => setFlagDescription(e.target.value)}
              className="neo-glass-input mt-1 resize-none h-16 bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:bg-white/10 focus:border-white/20"
            />
          </div>
          
          <DialogFooter className="gap-2 p-0">
            <Button 
              variant="outline" 
              onClick={() => setShowFlagDialog(false)}
              size="sm"
              className="neo-glass-button secondary bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFlag} 
              disabled={!flagReason || flagPulseMutation.isPending}
              size="sm"
              className="neo-glass-button bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              {flagPulseMutation.isPending ? "Submitting..." : "Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}