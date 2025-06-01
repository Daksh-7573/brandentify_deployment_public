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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCreator ? (
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Pulse
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowFlagDialog(true)}>
              <Flag className="mr-2 h-4 w-4" />
              Flag Pulse
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your pulse and remove it from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePulseMutation.isPending}
            >
              {deletePulseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Pulse</DialogTitle>
            <DialogDescription>
              Help us understand why this content violates our community guidelines.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reason for flagging</Label>
              <RadioGroup value={flagReason} onValueChange={setFlagReason} className="mt-2">
                {flagReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value}>{reason.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="description">Additional details (optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide any additional context that might help us review this content..."
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFlag} 
              disabled={!flagReason || flagPulseMutation.isPending}
            >
              {flagPulseMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}