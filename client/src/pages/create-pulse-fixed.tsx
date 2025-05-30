import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, BarChart, Video, Image, FileCode, Loader2, X, Award, Rocket, BadgeCheck, Wrench, Bell, Zap, Briefcase, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertPulse } from "@shared/schema";
import { INDUSTRIES, INDUSTRY_DOMAINS } from "@shared/constants";
import { Link } from "wouter";

export default function CreatePulsePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pulseTitle, setPulseTitle] = useState("");
  const [pulseContent, setPulseContent] = useState("");
  const [pulseType, setPulseType] = useState("poll");
  const [mediaType, setMediaType] = useState("image");
  const [pulseCategory, setPulseCategory] = useState("");
  const [pulseIndustry, setPulseIndustry] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [activeProjectTab, setActiveProjectTab] = useState('project-details');
  const [projectUrl, setProjectUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const createPulseMutation = useMutation({
    mutationFn: async (pulseData: InsertPulse) => {
      const res = await apiRequest('POST', '/api/pulses', pulseData);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pulses'] });
      toast({
        title: "Pulse created",
        description: "Your pulse has been published successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating pulse:", error);
      toast({
        title: "Error",
        description: "Failed to create pulse. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4 pt-20">
        <div className="flex items-center mb-6">
          <Link to="/industry-pulse" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Industry Pulse</span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Pulse</h1>
            <p className="text-gray-600">Share your thoughts, projects, or expertise with the professional community</p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              {/* Pulse Type Selection */}
              <div className="space-y-6 mb-8">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">What would you like to share?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        pulseType === 'poll' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                      }`}
                      onClick={() => setPulseType('poll')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <BarChart className="h-10 w-10 mb-2 text-purple-500" />
                        <h3 className="font-medium">Trends</h3>
                        <p className="text-xs text-gray-500 mt-1">Ask questions with options</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        pulseType === 'media-pulse' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setPulseType('media-pulse')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Image className="h-10 w-10 mb-2 text-blue-500" />
                        <h3 className="font-medium">Insights</h3>
                        <p className="text-xs text-gray-500 mt-1">Share images or videos</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        pulseType === 'project' ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => setPulseType('project')}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <FileCode className="h-10 w-10 mb-2 text-green-500" />
                        <h3 className="font-medium">Projects</h3>
                        <p className="text-xs text-gray-500 mt-1">Showcase your work</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Project Creation with Tabs */}
              {pulseType === 'project' && (
                <div className="space-y-6">
                  <Tabs value={activeProjectTab} onValueChange={setActiveProjectTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-green-50">
                      <TabsTrigger value="project-details" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
                        Project Details
                      </TabsTrigger>
                      <TabsTrigger value="media" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
                        Media
                      </TabsTrigger>
                      <TabsTrigger value="team-members" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
                        Team Members
                      </TabsTrigger>
                      <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
                        Client
                      </TabsTrigger>
                    </TabsList>

                    {/* Project Details Tab */}
                    <TabsContent value="project-details" className="space-y-4 pt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="project-title" className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-green-500" />
                            <span>Project Title</span>
                          </Label>
                          <Input
                            id="project-title"
                            placeholder="Enter your project title"
                            value={pulseTitle}
                            onChange={(e) => setPulseTitle(e.target.value)}
                            className="border-green-100 focus-visible:ring-green-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project-content" className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-green-500" />
                            <span>Project Description</span>
                          </Label>
                          <Textarea
                            id="project-content"
                            placeholder="Describe your project, its goals, and key achievements..."
                            value={pulseContent}
                            onChange={(e) => setPulseContent(e.target.value)}
                            className="resize-none border-green-100 focus-visible:ring-green-500"
                            rows={4}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-industry" className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-green-500" />
                              <span>Industry</span>
                            </Label>
                            <div className="relative">
                              <select
                                id="project-industry"
                                value={pulseIndustry}
                                onChange={(e) => {
                                  setPulseIndustry(e.target.value);
                                  if (e.target.value !== pulseIndustry) {
                                    setPulseCategory("");
                                  }
                                }}
                                className="w-full h-10 px-3 pr-10 rounded-md border border-green-100 appearance-none cursor-pointer focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none text-sm"
                                required
                              >
                                <option value="">Select industry</option>
                                {INDUSTRIES.map((ind) => (
                                  <option key={ind} value={ind}>
                                    {ind}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
                            <div className="space-y-2">
                              <Label htmlFor="project-domain" className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-500" />
                                <span>Domain Specialty</span>
                              </Label>
                              <div className="relative">
                                <select
                                  id="project-domain"
                                  value={pulseCategory}
                                  onChange={(e) => setPulseCategory(e.target.value)}
                                  className="w-full h-10 px-3 pr-10 rounded-md border border-green-100 appearance-none cursor-pointer focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none text-sm"
                                >
                                  <option value="">Select domain specialty</option>
                                  {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
                                    <option key={dom} value={dom}>
                                      {dom}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="project-url" className="flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-green-500" />
                            <span>Project URL</span>
                          </Label>
                          <Input
                            id="project-url"
                            placeholder="https://your-project-url.com"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            className="border-green-100 focus-visible:ring-green-500"
                            type="url"
                          />
                          <p className="text-xs text-muted-foreground">
                            Link to your live project, GitHub repository, or portfolio page
                          </p>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button 
                            type="button"
                            onClick={() => {
                              if (!user) {
                                toast({
                                  title: "Error",
                                  description: "You must be logged in to create a project",
                                  variant: "destructive",
                                });
                                return;
                              }

                              createPulseMutation.mutate({
                                userId: user.id,
                                type: "project" as any,
                                title: pulseTitle,
                                content: pulseContent,
                                isPublished: true,
                                industry: pulseIndustry.trim() !== "" ? pulseIndustry : undefined
                              });
                            }}
                            className="px-6 bg-green-600 hover:bg-green-700 text-white"
                            disabled={!pulseTitle || !pulseContent || !pulseIndustry || createPulseMutation.isPending}
                          >
                            {createPulseMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create & Publish Project"
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Media Tab */}
                    <TabsContent value="media" className="space-y-4 pt-4">
                      <div className="text-center py-8">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Media Upload Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">
                          Project media upload functionality will be available in the next update.
                          For now, you can add media through your project URL.
                        </p>
                      </div>
                    </TabsContent>

                    {/* Team Members Tab */}
                    <TabsContent value="team-members" className="space-y-4 pt-4">
                      <div className="text-center py-8">
                        <FileCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Team Management Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">
                          Team member management functionality will be available in the next update.
                          You can mention team members in your project description for now.
                        </p>
                      </div>
                    </TabsContent>

                    {/* Client Tab */}
                    <TabsContent value="client" className="space-y-4 pt-4">
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Client Endorsements Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">
                          Client endorsement functionality will be available in the next update.
                          You can mention client feedback in your project description for now.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Other pulse types content would go here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}