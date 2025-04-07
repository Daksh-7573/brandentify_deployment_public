import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pulse } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ThumbsUp, Calendar, Users, BarChart, Video, Image, FileCode } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Extended Pulse type with user info for display purposes
interface PulseWithUser {
  id: number;
  userId: number;
  type: "poll" | "media-pulse" | "project";
  title: string;
  content: string | null;
  mediaType: "image" | "video" | null;
  mediaUrls: string[]; // Array of media URLs
  pollOptions: string[]; // Array of poll options
  projectId: number | null;
  likes: number;
  comments: number;
  isPublished: boolean;
  createdAt: string | Date; // Can be a string from the API
  updatedAt: string | Date;
  // Additional display properties
  user?: {
    name: string | null;
    photoURL: string | null;
  };
  projectDetails?: string;
}

export default function IndustryPulsePage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all pulses
  const { data: pulses = [], isLoading } = useQuery<PulseWithUser[]>({
    queryKey: ["/api/pulses"],
  });
  
  // Filter pulses based on the active tab
  const filteredPulses = pulses.filter(pulse => {
    if (activeTab === "all") return true;
    return pulse.type === activeTab;
  });

  const getPulseIcon = (pulse: PulseWithUser) => {
    switch (pulse.type) {
      case "poll":
        return <BarChart className="h-5 w-5 text-purple-500" />;
      case "media-pulse":
        return pulse.mediaType === "video" ? 
          <Video className="h-5 w-5 text-blue-500" /> : 
          <Image className="h-5 w-5 text-blue-500" />;
      case "project":
        return <FileCode className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        <Sidebar activePage="industry-pulse" />
        <div className="flex-1 overflow-auto">
          <div className="container py-8 px-6 max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Industry Pulse</h1>
                <p className="text-muted-foreground mt-1">
                  Discover insights, polls, and media from your professional network
                </p>
              </div>
              <Button onClick={() => window.location.href = "/create-pulse"}>
                Create Pulse
              </Button>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="poll">Polls</TabsTrigger>
                <TabsTrigger value="media-pulse">Media</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : filteredPulses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No pulses yet</h3>
                      <p className="text-center text-muted-foreground max-w-md mb-6">
                        {activeTab === "all" 
                          ? "Be the first to create a pulse in your professional network!" 
                          : `No ${activeTab} pulses available yet. Create one to get started!`}
                      </p>
                      <Button onClick={() => window.location.href = "/create-pulse"}>
                        Create Your First Pulse
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {filteredPulses.map((pulse) => (
                      <Card key={pulse.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <div className="flex gap-3 items-center">
                              <Avatar>
                                <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
                                <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{pulse.user?.name || "User"}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {pulse.createdAt 
                                    ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
                                    : "Recently"}
                                </div>
                              </div>
                            </div>
                            <div>
                              {getPulseIcon(pulse)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardTitle className="mb-3">{pulse.title}</CardTitle>
                          <p className="text-muted-foreground">{pulse.content}</p>
                          
                          {/* Render pulse content based on type */}
                          {pulse.type === 'poll' && (
                            <div className="mt-4 space-y-2 border rounded-md p-4 bg-purple-50/30">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <BarChart className="h-4 w-4 text-purple-500" />
                                <span>Poll Options</span>
                              </div>
                              <div className="space-y-2 pl-2">
                                {pulse.pollOptions.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {pulse.type === 'media-pulse' && pulse.mediaType === 'image' && pulse.mediaUrls && (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <Image className="h-4 w-4 text-blue-500" />
                                <span>Image Gallery</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {pulse.mediaUrls.slice(0, 4).map((url, index) => (
                                  <img 
                                    key={index} 
                                    src={url} 
                                    alt={`Media ${index + 1}`} 
                                    className="w-full h-48 object-cover rounded-md"
                                  />
                                ))}
                                {pulse.mediaUrls.length > 4 && (
                                  <div className="relative">
                                    <img 
                                      src={pulse.mediaUrls[4]} 
                                      alt="Media 5" 
                                      className="w-full h-48 object-cover rounded-md opacity-70"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                                      <span className="text-white font-bold text-lg">+{pulse.mediaUrls.length - 4} more</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {pulse.type === 'media-pulse' && pulse.mediaType === 'video' && pulse.mediaUrls && (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <Video className="h-4 w-4 text-blue-500" />
                                <span>Video</span>
                              </div>
                              <div className="bg-blue-50/30 border rounded-md p-2">
                                <video 
                                  src={pulse.mediaUrls.length > 0 ? pulse.mediaUrls[0] : ''} 
                                  controls 
                                  className="w-full rounded-md"
                                  style={{ maxHeight: "400px" }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {pulse.type === 'project' && (
                            <div className="mt-4 space-y-2 border rounded-md p-4 bg-green-50/30">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-green-500" />
                                <span>Project Details</span>
                              </div>
                              <p className="text-sm pl-2">{pulse.projectDetails || "No details available"}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <div className="flex space-x-4">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {pulse.likes || 0} Likes
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {pulse.comments || 0} Comments
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}