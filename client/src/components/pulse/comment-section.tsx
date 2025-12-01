import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Skeleton loader component
function CommentSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="space-y-1 mt-2">
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-5/6 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface Comment {
  id: number;
  pulseId: number;
  userId: number;
  content: string;
  createdAt: Date;
  user?: {
    id: number;
    name: string;
    photoURL?: string;
  };
}

interface CommentSectionProps {
  pulseId: number;
  initialCommentCount?: number;
  isExpanded?: boolean;
}

export function CommentSection({ pulseId, initialCommentCount = 0, isExpanded = false }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [displayedCount, setDisplayedCount] = useState(5); // Show 5 newest initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const COMMENTS_PER_LOAD = 5; // Load 5 at a time

  // Clear all caches on mount
  useEffect(() => {
    if (isExpanded) {
      setDisplayedCount(5); // Reset pagination
      setIsLoadingMore(false);
      const cacheKey = `api_cache_/api/pulses/${pulseId}/comments`;
      localStorage.removeItem(cacheKey);
      // Also invalidate React Query cache and refetch
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulseId}/comments`] });
      console.log(`[CommentSection] Cleared all caches for pulse ${pulseId}`);
    }
  }, [pulseId, isExpanded]);

  // Fetch comments for this pulse - force fresh data
  const { data: allComments = [], isLoading, refetch } = useQuery<Comment[]>({
    queryKey: [`/api/pulses/${pulseId}/comments`],
    enabled: isExpanded,
    staleTime: 0,
    gcTime: 0,
  });

  // Force refetch when expanded
  useEffect(() => {
    if (isExpanded) {
      refetch();
    }
  }, [isExpanded, refetch]);

  // Reverse comments (newest first) and get displayed ones
  const reversedComments = [...allComments].reverse();
  const displayedComments = reversedComments.slice(0, displayedCount);
  const hasMore = displayedCount < reversedComments.length;

  // Intersection Observer for auto-loading older comments
  useEffect(() => {
    if (!topSentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          setIsLoadingMore(true);
          // Simulate a small delay for better UX
          setTimeout(() => {
            setDisplayedCount((prev) => prev + COMMENTS_PER_LOAD);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading]);

  // Auto-scroll to latest comment when comments change
  useEffect(() => {
    if (isExpanded && reversedComments.length > 0) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [reversedComments, isExpanded]);

  // Debug: Log comment data
  console.log(`[CommentSection] Comments for pulse ${pulseId}:`, reversedComments);
  if (reversedComments.length > 0) {
    console.log(`[CommentSection] First comment user data:`, reversedComments[0].user);
  }

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/pulse-comments`, {
        pulseId,
        userId: user?.id,
        content,
      });
    },
    onMutate: async (content: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/pulses/${pulseId}/comments`] });
      
      // Snapshot the previous comments
      const previousComments = queryClient.getQueryData<Comment[]>([`/api/pulses/${pulseId}/comments`]);
      
      // Create optimistic comment
      const optimisticComment: Comment = {
        id: Math.floor(Math.random() * -1000000), // Temporary ID
        pulseId,
        userId: user?.id || 0,
        content,
        createdAt: new Date(),
        user: user ? {
          id: user.id,
          name: user.name,
          photoURL: user.photoURL,
        } : undefined,
      };
      
      // Update cache with optimistic comment
      queryClient.setQueryData([`/api/pulses/${pulseId}/comments`], (old: Comment[] = []) => [
        ...old,
        optimisticComment,
      ]);
      
      return { previousComments };
    },
    onSuccess: (newComment) => {
      // Replace temporary optimistic comments with real ones
      queryClient.setQueryData([`/api/pulses/${pulseId}/comments`], (old: Comment[] = []) => {
        return old.map((comment) => {
          // Replace optimistic comment with server response if IDs match on content
          if (comment.id < 0 && comment.content === newComment.content && comment.userId === newComment.userId) {
            return newComment;
          }
          return comment;
        });
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
      setCommentText("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error, variables, context: any) => {
      // Rollback to previous comments on error
      if (context?.previousComments) {
        queryClient.setQueryData([`/api/pulses/${pulseId}/comments`], context.previousComments);
      }
      
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return apiRequest("DELETE", `/api/pulse-comments/${commentId}`, {
        userId: user?.id,
      });
    },
    onMutate: async (commentId: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/pulses/${pulseId}/comments`] });
      
      // Snapshot the previous comments
      const previousComments = queryClient.getQueryData<Comment[]>([`/api/pulses/${pulseId}/comments`]);
      
      // Update cache - remove the comment optimistically
      queryClient.setQueryData([`/api/pulses/${pulseId}/comments`], (old: Comment[] = []) => {
        return old.filter((comment) => comment.id !== commentId);
      });
      
      return { previousComments };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    },
    onError: (error, variables, context: any) => {
      // Rollback to previous comments on error
      if (context?.previousComments) {
        queryClient.setQueryData([`/api/pulses/${pulseId}/comments`], context.previousComments);
      }
      
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    if (commentText.length > 500) {
      toast({
        title: "Comment too long",
        description: "Please keep your comment under 500 characters.",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate(commentText);
  };

  const formatCommentDate = (dateValue: Date | string | undefined) => {
    try {
      if (!dateValue) return "just now";
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) return "just now";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  return (
    <div className="mt-4">
      {/* Comment Section - Glass Design */}
      {isExpanded && (
        <div className="mt-4 space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          {/* Comments List */}
          {isLoading && reversedComments.length === 0 ? (
            <div className="space-y-3">
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          ) : reversedComments.length === 0 ? (
            <p className="text-center text-white/50 py-4 text-sm">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                {/* Sentinel for auto-loading older comments */}
                <div ref={topSentinelRef} />
                
                {/* Skeleton loaders while loading more comments */}
                {isLoadingMore && (
                  <>
                    <CommentSkeleton />
                    <CommentSkeleton />
                  </>
                )}

                {displayedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    data-testid={`comment-${comment.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 border border-white/20">
                        {comment.user?.photoURL ? (
                          <AvatarImage src={comment.user.photoURL} alt={comment.user.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white font-semibold">
                            {comment.user?.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white text-sm">
                              {comment.user?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-white/50">
                              {formatCommentDate(comment.createdAt)}
                            </p>
                          </div>
                          {user?.id === comment.userId && (
                            <button
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition-colors"
                              data-testid={`button-delete-comment-${comment.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-white/80 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Scroll anchor for auto-scroll to latest comment */}
                <div ref={commentsEndRef} />
              </div>
            </div>
          )}

          {/* Add Comment Form */}
          {user && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 border border-white/20">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.name || "You"} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[60px] bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/30 resize-none"
                    maxLength={500}
                    data-testid={`input-comment-${pulseId}`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-white/40">
                      {commentText.length}/500
                    </span>
                    <Button
                      onClick={handlePostComment}
                      disabled={!commentText.trim() || createCommentMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                      data-testid={`button-post-comment-${pulseId}`}
                    >
                      {createCommentMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
