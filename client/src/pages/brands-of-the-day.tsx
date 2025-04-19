import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { BrandOfTheDayCard } from "@/components/brands-of-the-day/brand-of-the-day-card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandOfTheDay } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Trophy, RefreshCw, Share2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// List of industries for the filter
const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Media",
  "Consulting",
  "Legal",
  "Real Estate",
  "Non-profit",
  "Other"
];

// List of domains for the filter
const domains = [
  "Software Development",
  "Data Science",
  "Product Management",
  "Marketing",
  "Sales",
  "Human Resources",
  "Customer Support",
  "Operations",
  "Design",
  "Research",
  "Engineering",
  "Executive",
  "Other"
];

export default function BrandsOfTheDayPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [industry, setIndustry] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [tab, setTab] = useState<string>("all");
  const queryClient = useQueryClient();
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : user?.uid;

  // Get all brands of the day
  const { data: allBrands, isLoading: isAllBrandsLoading } = useQuery({
    queryKey: ['/api/brands-of-the-day'],
    select: (data) => data as BrandOfTheDay[],
  });

  // Get user's brands of the day if user is logged in
  const { data: userBrands, isLoading: isUserBrandsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'brands-of-the-day'],
    select: (data) => data as BrandOfTheDay[],
    enabled: !!userId,
  });

  // Query for filtered brands by industry and domain
  const { data: filteredBrands, isLoading: isFilteredBrandsLoading } = useQuery({
    queryKey: ['/api/brands-of-the-day', industry, domain, date ? format(date, 'yyyy-MM-dd') : ''],
    select: (data) => [data] as BrandOfTheDay[],
    enabled: !!(industry && domain),
  });

  // Mutation to share a brand of the day
  const shareMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/brands-of-the-day/${id}/share`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      toast({
        title: "Shared!",
        description: "You have successfully shared this recognition.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/brands-of-the-day'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'brands-of-the-day'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation to calculate user's brand value score
  const calculateScoreMutation = useMutation({
    mutationFn: () => {
      if (!userId) return Promise.reject("User not logged in");
      return apiRequest(`/api/users/${userId}/calculate-brand-value-score`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Brand Value Score Calculated",
        description: `Your current score is ${data.score} out of 100.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate your score. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle sharing a brand
  const handleShare = (brand: BrandOfTheDay) => {
    shareMutation.mutate(brand.id);
  };

  // Display brands based on the selected tab
  const getBrandsToDisplay = () => {
    if (industry && domain) {
      return filteredBrands || [];
    }
    
    switch (tab) {
      case "mine":
        return userBrands || [];
      case "all":
      default:
        return allBrands || [];
    }
  };

  const isLoading = isAllBrandsLoading || isUserBrandsLoading || isFilteredBrandsLoading || shareMutation.isPending || calculateScoreMutation.isPending;

  return (
    <div className="container py-8">
      <Helmet>
        <title>Brands of the Day | Brandentifier</title>
      </Helmet>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            Brands of the Day
          </h1>
          <p className="text-muted-foreground mt-1">
            Exceptional professionals recognized for their outstanding brand value.
          </p>
        </div>
        
        {user && (
          <Button 
            onClick={() => calculateScoreMutation.mutate()}
            disabled={calculateScoreMutation.isPending}
            className="flex items-center gap-2"
          >
            {calculateScoreMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            Calculate My Score
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Domain</label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Domains</SelectItem>
                    {domains.map(dom => (
                      <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => {
                  setIndustry("");
                  setDomain("");
                  setDate(new Date());
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Brands</TabsTrigger>
              {user && <TabsTrigger value="mine">My Recognitions</TabsTrigger>}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getBrandsToDisplay().length > 0 ? (
                getBrandsToDisplay().map((brand) => (
                  <BrandOfTheDayCard
                    key={brand.id}
                    brand={brand}
                    onShare={handleShare}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Trophy className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No brands found</h3>
                  <p className="text-muted-foreground max-w-md">
                    {tab === "mine"
                      ? "You haven't been recognized as a Brand of the Day yet. Keep improving your profile to increase your chances!"
                      : "No brands of the day found with the current filters. Try adjusting your filters or check back later."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}