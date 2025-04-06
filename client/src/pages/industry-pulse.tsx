import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Bookmark, Share, BarChart } from "lucide-react";
import CreatePulsePostDialog from "@/components/industry-pulse/create-post-dialog";

interface IndustryPulsePost {
  id: number;
  title: string;
  content: string;
  postType: "news" | "poll" | "image" | "video";
  industry: string;
  tags: string[];
  mediaUrl: string | null;
  pollOptions: string[] | null;
  userId: number;
  username: string;
  userPhotoURL: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function IndustryPulsePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const { data: posts = [], isLoading } = useQuery<IndustryPulsePost[]>({
    queryKey: ["/api/industry-pulse/posts"],
    staleTime: 1000 * 60,
  });

  // Filter posts based on the active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true;
    if (activeTab === "myPosts") return post.userId === user?.id;
    return post.industry.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="container p-4 mx-auto max-w-6xl">
      <PageHeader
        title="Industry Pulse"
        description="Stay updated with the latest insights from your industry"
        rightContent={
          <Button onClick={() => setIsCreatePostOpen(true)}>
            New Post
          </Button>
        }
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="myPosts">My Posts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between w-full">
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "myPosts"
                  ? "You haven't created any posts yet."
                  : "No posts available in this category."}
              </p>
              <Button
                onClick={() => setIsCreatePostOpen(true)}
                className="mt-4"
              >
                Create a Post
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.map((post) => (
                <PulsePostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreatePulsePostDialog
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => {
          toast({
            title: "Post created",
            description: "Your post has been published successfully.",
          });
        }}
      />
    </div>
  );
}

interface PulsePostCardProps {
  post: IndustryPulsePost;
}

function PulsePostCard({ post }: PulsePostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarksCount);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleLike = () => {
    // Toggle like state
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    // Here we would call the API to update the like status
    // For now we'll just show a toast
    toast({
      title: isLiked ? "Post unliked" : "Post liked",
      description: isLiked
        ? "You have removed your like from this post"
        : "You have liked this post",
    });
  };

  const handleBookmark = () => {
    // Toggle bookmark state
    setIsBookmarked(!isBookmarked);
    setBookmarksCount(isBookmarked ? bookmarksCount - 1 : bookmarksCount + 1);

    // Here we would call the API to update the bookmark status
    // For now we'll just show a toast
    toast({
      title: isBookmarked ? "Post unbookmarked" : "Post bookmarked",
      description: isBookmarked
        ? "You have removed this post from your bookmarks"
        : "You have bookmarked this post for later",
    });
  };

  const handleShare = () => {
    // Copy the post link to clipboard
    // For now we'll just show a toast
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    });
  };

  const renderPostContent = () => {
    switch (post.postType) {
      case "image":
        return post.mediaUrl ? (
          <div className="mt-4">
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="rounded-md max-h-96 w-full object-cover"
            />
          </div>
        ) : (
          <p className="text-gray-500 italic mt-2">Image not available</p>
        );
      case "video":
        return post.mediaUrl ? (
          <div className="mt-4 aspect-video">
            <iframe
              src={post.mediaUrl}
              className="w-full h-full rounded-md"
              allowFullScreen
              title={post.title}
            ></iframe>
          </div>
        ) : (
          <p className="text-gray-500 italic mt-2">Video not available</p>
        );
      case "poll":
        return post.pollOptions ? (
          <div className="mt-4 space-y-2">
            {post.pollOptions.map((option, index) => (
              <div
                key={index}
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-md cursor-pointer flex justify-between"
              >
                <span>{option}</span>
                <span className="text-gray-500">0%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic mt-2">Poll options not available</p>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              {post.userPhotoURL ? (
                <img
                  src={post.userPhotoURL}
                  alt={post.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary text-lg font-semibold">
                  {post.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium">{post.username}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className="capitalize">{post.industry}</span>
              </div>
            </div>
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
            {post.postType}
          </div>
        </div>
        <CardTitle className="text-xl mt-2">{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{post.content}</p>
        {renderPostContent()}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <div
                key={index}
                className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
              >
                #{tag}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? "text-primary" : ""}
          >
            <ThumbsUp className="mr-1 h-4 w-4" />
            <span>{likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-1 h-4 w-4" />
            <span>{post.commentsCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={isBookmarked ? "text-primary" : ""}
          >
            <Bookmark className="mr-1 h-4 w-4" />
            <span>{bookmarksCount}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share className="mr-1 h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}