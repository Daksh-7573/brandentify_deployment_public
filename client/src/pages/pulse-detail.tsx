import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2, ThumbsUp, ThumbsDown, Calendar, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableUserSelect } from "@/components/share/searchable-user-select";
import { SocialShareButtons } from "@/components/share/social-share-buttons";
import { format } from "date-fns";

interface PulseUser {
  id: number;
  name: string;
  username: string;
  photoURL: string | null;
  title: string | null;
  company: string | null;
  brandName: string | null;
}

interface Pulse {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string | null;
  industry: string | null;
  domain: string | null;
  mediaUrls: string[] | null;
  pollOptions: string[] | null;
  createdAt: string;
  user?: PulseUser;
}

interface PollVote {
  id: number;
  pulseId: number;
  userId: number;
  optionIndex: number;
}

interface Reaction {
  id: number;
  pulseId: number;
  userId: number;
  reactionType: "insightful" | "misinformed";
  createdAt: string;
}

export default function PulseDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareRecipientId, setShareRecipientId] = useState<number | null>(null);

  // Fetch the pulse
  const { data: pulse, isLoading: isPulseLoading } = useQuery<Pulse>({
    queryKey: [`/api/pulses/${id}`],
    enabled: !!id,
  });

  // Fetch reactions
  const { data: reactions = [] } = useQuery<Reaction[]>({
    queryKey: [`/api/pulses/${id}/reactions`],
    enabled: !!id,
  });

  // Fetch poll votes if it's a poll
  const { data: pollVotes = [] } = useQuery<PollVote[]>({
    queryKey: [`/api/pulses/${id}/poll-votes`],
    enabled: !!id && pulse?.type === "poll",
  });

  const getDisplayTitle = (user: PulseUser | undefined) => {
    if (!user) return "Unknown User";
    if (user.title && user.company) {
      return `${user.title} at ${user.company}`;
    }
    if (user.title) return user.title;
    if (user.company) return user.company;
    return user.username;
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPollResults = () => {
    if (!pulse?.pollOptions || !pollVotes) return null;

    const totalVotes = pollVotes.length;
    const voteCounts = pulse.pollOptions.map((_, index) => 
      pollVotes.filter(vote => vote.optionIndex === index).length
    );

    return pulse.pollOptions.map((option, index) => ({
      option,
      votes: voteCounts[index],
      percentage: totalVotes > 0 ? Math.round((voteCounts[index] / totalVotes) * 100) : 0,
    }));
  };

  const insightfulCount = reactions.filter(r => r.reactionType === "insightful").length;
  const misinformedCount = reactions.filter(r => r.reactionType === "misinformed").length;

  const shareUrl = window.location.href;

  if (isPulseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card className="p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-6" />
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!pulse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Pulse Not Found</h1>
          <p className="text-gray-400 mb-6">The pulse you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/industry-pulse-new")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pulses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/industry-pulse-new")}
          className="mb-6"
          data-testid="button-back-to-pulses"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pulses
        </Button>

        {/* Main Pulse Card */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl p-8">
          {/* Author Info */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-purple-500/30" data-testid="img-author-avatar">
                <AvatarImage src={pulse.user?.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {getInitials(pulse.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white text-lg" data-testid="text-author-name">
                  {pulse.user?.name || "Unknown User"}
                </h3>
                <p className="text-sm text-gray-400" data-testid="text-author-title">
                  {getDisplayTitle(pulse.user)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span data-testid="text-pulse-date">
                    {format(new Date(pulse.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              className="border-purple-500/30 hover:bg-purple-500/10"
              data-testid="button-share-pulse"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Industry & Domain Tags */}
          {(pulse.industry || pulse.domain) && (
            <div className="flex gap-2 mb-6">
              {pulse.industry && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                  {pulse.industry}
                </span>
              )}
              {pulse.domain && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                  {pulse.domain}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6" data-testid="text-pulse-title">
            {pulse.title}
          </h1>

          {/* Content */}
          {pulse.content && (
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-gray-300 whitespace-pre-wrap" data-testid="text-pulse-content">
                {pulse.content}
              </p>
            </div>
          )}

          {/* Media */}
          {pulse.mediaUrls && pulse.mediaUrls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {pulse.mediaUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Pulse media ${index + 1}`}
                  className="rounded-lg w-full object-cover max-h-96"
                  data-testid={`img-pulse-media-${index}`}
                />
              ))}
            </div>
          )}

          {/* Poll Results */}
          {pulse.type === "poll" && pulse.pollOptions && (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Poll Results</h3>
              {getPollResults()?.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{result.option}</span>
                    <span className="text-purple-400 font-medium">
                      {result.votes} votes ({result.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-sm text-gray-400 mt-4">
                Total votes: {pollVotes.length}
              </p>
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <ThumbsUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400" data-testid="text-insightful-count">
                  {insightfulCount}
                </span>
              </div>
              <span className="text-xs text-gray-500">Insightful</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <ThumbsDown className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-400" data-testid="text-misinformed-count">
                  {misinformedCount}
                </span>
              </div>
              <span className="text-xs text-gray-500">Misinformed</span>
            </div>
          </div>
        </Card>

        {/* Author's Other Info */}
        {pulse.user && (
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">About the Author</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                <AvatarImage src={pulse.user.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {getInitials(pulse.user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${pulse.user.brandName || pulse.user.username}`}>
                  <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 h-auto">
                    {pulse.user.name}
                  </Button>
                </Link>
                <p className="text-sm text-gray-400">{getDisplayTitle(pulse.user)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="backdrop-blur-xl bg-gray-900/95 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Share Pulse</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Social Share Buttons */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Share on social media</h3>
              <SocialShareButtons 
                url={shareUrl}
                title={pulse.title}
                description={pulse.content || "Check out this pulse on Brandentifier"}
              />
            </div>

            {/* Internal Share */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Share with Brandentifier user</h3>
              <SearchableUserSelect
                currentUserId={pulse.userId}
                selectedUserId={shareRecipientId}
                onUserSelect={setShareRecipientId}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
