/**
 * Mentor Review Popup Component
 * Appears after a mentorship ends (or expires) to let users rate their mentor
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Star, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentorReviewPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: number;
  mentorName: string;
  mentorPhotoURL?: string | null;
  reviewerId: number;
  followId?: number | null;
  onReviewComplete?: () => void;
}

export function MentorReviewPopup({
  isOpen,
  onOpenChange,
  mentorId,
  mentorName,
  mentorPhotoURL,
  reviewerId,
  followId,
  onReviewComplete
}: MentorReviewPopupProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/mentor/review', {
        mentorId,
        reviewerId,
        followId: followId || null,
        rating,
        comment: comment.trim() || undefined
      });
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/rating', mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/reviews', mentorId] });
      
      // Close after a short delay to show success state
      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
        setRating(0);
        setComment("");
        onReviewComplete?.();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Could not submit review",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose between 1-5 stars before submitting.",
        variant: "destructive"
      });
      return;
    }
    submitReviewMutation.mutate();
  };

  const handleSkip = () => {
    onOpenChange(false);
    onReviewComplete?.();
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[rgba(18,18,18,0.95)] backdrop-blur-[15px] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserCheck className="h-5 w-5 text-primary" />
            Rate Your Mentor
          </DialogTitle>
          <DialogDescription className="text-white/70">
            How was your mentorship experience?
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
            <p className="text-white/70">Your feedback helps improve the mentorship experience.</p>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Mentor Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentorPhotoURL || undefined} alt={mentorName} />
                <AvatarFallback>{mentorName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{mentorName}</p>
                <p className="text-sm text-white/60">Your Mentor</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= displayRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <p className="text-sm text-white/60">
                  {displayRating === 1 && "Poor"}
                  {displayRating === 2 && "Fair"}
                  {displayRating === 3 && "Good"}
                  {displayRating === 4 && "Very Good"}
                  {displayRating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Comment (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Share your experience (optional)
              </label>
              <Textarea
                placeholder="What did you learn? How did they help you?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                data-testid="input-review-comment"
              />
            </div>
          </div>
        )}

        {!submitted && (
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-white/60 hover:text-white"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitReviewMutation.isPending || rating === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {submitReviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Star className="h-4 w-4 mr-2" />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to check for pending mentor reviews
 * Returns mentorships that have expired but haven't been reviewed yet
 */
export function usePendingMentorReviews(userId: number | undefined) {
  const { data: pendingReviews, isLoading } = useQuery({
    queryKey: ['/api/mentor/pending-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/mentor/pending-reviews/${userId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    pendingReviews: pendingReviews || [],
    isLoading,
    hasPendingReviews: pendingReviews?.length > 0
  };
}
