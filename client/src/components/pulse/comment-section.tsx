import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
}

export function CommentSection({ pulseId, initialCommentCount = 0 }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Fetch comments for this pulse
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/pulses/${pulseId}/comments`],
    enabled: isExpanded,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/pulse-comments`, {
        method: "POST",
        body: JSON.stringify({
          pulseId,
          userId: user?.id,
          content,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulseId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
      setCommentText("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
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
      return apiRequest(`/api/pulse-comments/${commentId}`, {
        method: "DELETE",
        body: JSON.stringify({ userId: user?.id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulseId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    },
    onError: () => {
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

  const commentCount = comments.length || initialCommentCount;

  return (
    <div className="mt-4">
      {/* Comment Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-gray-400 hover:text-white hover:bg-gray-600/30 hover:scale-105 rounded-md px-3 py-1.5 text-sm flex items-center gap-2 transition-all duration-200"
        data-testid={`button-toggle-comments-${pulseId}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
      </button>

      {/* Comment Section - Glass Design */}
      {isExpanded && (
        <div className="mt-4 space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          {/* Comments List */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-white/70" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-white/50 py-4 text-sm">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  data-testid={`comment-${comment.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      {comment.user?.photoURL ? (
                        <AvatarImage src={comment.user.photoURL} alt={comment.user.name} />
                      ) : (
                        <AvatarFallback className="bg-white/10 text-white">
                          {comment.user?.name?.[0] || "U"}
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
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
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
            </div>
          )}

          {/* Add Comment Form */}
          {user && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.name || "You"} />
                  ) : (
                    <AvatarFallback className="bg-white/10 text-white">
                      {user.name?.[0] || "U"}
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
