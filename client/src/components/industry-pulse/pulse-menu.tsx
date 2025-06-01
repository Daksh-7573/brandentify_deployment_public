import { useState } from "react";
import { MoreHorizontal, Trash2, Flag } from "lucide-react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [flagReason, setFlagReason] = useState("");
  const [flagDescription, setFlagDescription] = useState("");
  
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
      toast({
        title: "Pulse flagged",
        description: "Thank you for reporting this content. We'll review it shortly.",
      });
      setShowFlagDialog(false);
      setFlagReason("");
      setFlagDescription("");
    },
    onError: (error) => {
      toast({
        title: "Failed to flag pulse",
        description: "There was an error reporting this content. Please try again.",
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
      <DropdownMenu>
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
                color: '#ff6b6b !important',
                '--text-color': '#ff6b6b'
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" style={{ color: '#ff6b6b' }} />
              <span style={{ color: '#ff6b6b' }}>Delete Pulse</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowFlagDialog(true)}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold flex items-center hover:bg-white/20"
              style={{ 
                color: '#ffffff !important',
                '--text-color': '#ffffff'
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
        <DialogContent className="neo-glass-panel border-0 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">Flag Pulse</DialogTitle>
            <DialogDescription className="text-white/70 text-sm">
              Help us understand why this content violates our community guidelines.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white text-sm font-medium">Reason for flagging</Label>
              <RadioGroup value={flagReason} onValueChange={setFlagReason} className="mt-3">
                {flagReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={reason.value} 
                      id={reason.value} 
                      className="border-white/30 text-white data-[state=checked]:bg-white/20 data-[state=checked]:border-white"
                    />
                    <Label htmlFor={reason.value} className="text-white/80 text-sm">{reason.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-white text-sm font-medium">Additional details (optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide any additional context that might help us review this content..."
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                className="neo-glass-input mt-2 resize-none h-20"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowFlagDialog(false)}
              className="neo-glass-button secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFlag} 
              disabled={!flagReason || flagPulseMutation.isPending}
              className="neo-glass-button"
            >
              {flagPulseMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}