import { useState } from "react";
import { Flag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PulseFlagButtonProps {
  pulseId: number;
  className?: string;
}

export function PulseFlagButton({ pulseId, className }: PulseFlagButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [flagReason, setFlagReason] = useState<string>("inappropriate");
  const [flagDetails, setFlagDetails] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Mutation for creating a flag
  const flagMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/flags/pulse", {
        pulseId,
        reason: flagReason,
        details: flagDetails,
        status: "pending"
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to flag content");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep the community safe. A moderator will review this content.",
      });
      setDialogOpen(false);
      setFlagDetails("");
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report content",
        variant: "destructive"
      });
      return;
    }
    
    flagMutation.mutate();
  };
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={`text-muted-foreground ${className || ""}`}>
          <Flag className="h-4 w-4" />
          <span className="sr-only">Flag content</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
          <DialogDescription>
            Flag this content for review by moderators if it violates community guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup 
            value={flagReason} 
            onValueChange={setFlagReason} 
            className="grid gap-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="inappropriate" id="inappropriate" />
              <Label htmlFor="inappropriate" className="flex flex-col">
                <span className="font-medium">Inappropriate Content</span>
                <span className="text-xs text-muted-foreground">Offensive, harmful, or unsafe content</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="misinformation" id="misinformation" />
              <Label htmlFor="misinformation" className="flex flex-col">
                <span className="font-medium">Misinformation</span>
                <span className="text-xs text-muted-foreground">Contains false or misleading information</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam" className="flex flex-col">
                <span className="font-medium">Spam</span>
                <span className="text-xs text-muted-foreground">Unwanted commercial content or repetitive posts</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="flex flex-col">
                <span className="font-medium">Other</span>
                <span className="text-xs text-muted-foreground">Other content policy violation</span>
              </Label>
            </div>
          </RadioGroup>
          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea 
              id="details" 
              placeholder="Please provide any additional context..." 
              value={flagDetails}
              onChange={(e) => setFlagDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={flagMutation.isPending}
          >
            {flagMutation.isPending && (
              <span className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}