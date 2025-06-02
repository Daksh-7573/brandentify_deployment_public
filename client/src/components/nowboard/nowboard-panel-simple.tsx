import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { NowboardMenu } from "./nowboard-menu";

interface NowboardItem {
  id: number;
  userId: number;
  content: string;
  category: string;
  visibility: string;
  createdAt: string;
  inspiredCount?: number;
  user?: {
    name: string;
    photoURL?: string;
  };
}

// Simple Lightbulb Icon Component
function LightbulbIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Lightbulb base/screw */}
      <rect x="9" y="18" width="6" height="2" rx="1" />
      <rect x="10" y="20" width="4" height="1" rx="0.5" />
      
      {/* Main bulb shape - simple circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="5"
        fill={filled ? "currentColor" : "none"}
      />
      
      {/* Simple filament - single cross */}
      <path 
        d="M10 10l4 4M14 10l-4 4"
        stroke={filled ? "rgba(255,255,255,0.7)" : "currentColor"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Inspired Button Component
function InspiredButton({ 
  itemId, 
  userId, 
  currentCount = 0 
}: { 
  itemId: number; 
  userId: number; 
  currentCount: number 
}) {
  const { toast } = useToast();
  const [isInspired, setIsInspired] = useState(false);
  const [count, setCount] = useState(currentCount);

  // Check if user has already inspired this item
  const { data: inspiredStatus } = useQuery<{ isInspired: boolean }>({
    queryKey: [`/api/nowboard-items/${itemId}/inspired-by/${userId}`],
    enabled: !!itemId && !!userId,
    staleTime: 30000, // 30 seconds
  });

  // Update local state when inspired status is fetched
  useEffect(() => {
    if (inspiredStatus && inspiredStatus.isInspired !== undefined) {
      setIsInspired(inspiredStatus.isInspired);
    }
  }, [inspiredStatus]);

  // Update count when currentCount changes
  useEffect(() => {
    setCount(currentCount);
  }, [currentCount]);

  // Toggle inspired status
  const toggleInspired = useMutation({
    mutationFn: async () => {
      const method = isInspired ? 'DELETE' : 'POST';
      const response = await fetch(`/api/nowboard-items/${itemId}/inspired-by`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inspired status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      const newInspiredState = !isInspired;
      setIsInspired(newInspiredState);
      setCount(prev => newInspiredState ? prev + 1 : prev - 1);
      
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/nowboard-items'] });
      queryClient.invalidateQueries({ queryKey: [`/api/nowboard-items/${itemId}/inspired-by/${userId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inspired status. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <button
      onClick={() => toggleInspired.mutate()}
      disabled={toggleInspired.isPending}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base transition-colors hover:bg-white/10 ${
        isInspired 
          ? 'text-yellow-400' 
          : 'text-white/60 hover:text-white/80'
      }`}
    >
      <LightbulbIcon 
        className="h-4 w-4" 
        filled={isInspired}
      />
      <span className="font-medium">{count}</span>
    </button>
  );
}

export default function NowboardPanelSimple() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [newItemContent, setNewItemContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"learning" | "growth" | "launch" | "planning" | "collaboration" | "visibility">("learning");

  // For now, use hardcoded user ID since we know the current user is ID 4
  const userId = 4;

  // Fetch nowboard items with error handling
  const { data: nowboardItems = [], isLoading } = useQuery<NowboardItem[]>({
    queryKey: ['/api/nowboard-items'],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create mutation for new nowboard items
  const createMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      content: string;
      category: string;
      visibility: string;
    }) => {
      const response = await fetch('/api/nowboard-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create nowboard item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setNewItemContent("");
      toast({
        title: "Success",
        description: "Your update has been shared!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nowboard-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to share your update. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Simple submit handler
  const handleSubmit = () => {
    if (!newItemContent.trim()) {
      toast({
        title: "Empty update",
        description: "Please enter some content for your update.",
        variant: "destructive",
      });
      return;
    }
    
    if (newItemContent.length > 150) {
      toast({
        title: "Update too long",
        description: "Please keep your update under 150 characters.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({
      userId,
      content: newItemContent,
      category: selectedCategory,
      visibility: "public"
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <NeoGlassSection className="h-full flex flex-col">
      <div className="flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">Nowboard</h2>
          <p className="text-white/70 text-sm">What professionals are doing now</p>
        </div>
        
        <div className="pb-4 border-b border-white/10 mb-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Share what you're working on... (150 chars max)"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              className="resize-none text-sm min-h-[60px] bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/50 focus:ring-white/30"
              maxLength={150}
            />
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/30 text-white hover:bg-white/15 focus:ring-white/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                  <SelectItem value="learning" className="text-white hover:bg-white/10 focus:bg-white/10">Learning</SelectItem>
                  <SelectItem value="growth" className="text-white hover:bg-white/10 focus:bg-white/10">Growth</SelectItem>
                  <SelectItem value="launch" className="text-white hover:bg-white/10 focus:bg-white/10">Launch</SelectItem>
                  <SelectItem value="planning" className="text-white hover:bg-white/10 focus:bg-white/10">Planning</SelectItem>
                  <SelectItem value="collaboration" className="text-white hover:bg-white/10 focus:bg-white/10">Collaboration</SelectItem>
                  <SelectItem value="visibility" className="text-white hover:bg-white/10 focus:bg-white/10">Visibility</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                disabled={createMutation.isPending || !newItemContent.trim()}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share
              </button>
            </div>
            <div className="text-xs text-right text-white/60">
              {newItemContent.length}/150 characters
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        ) : nowboardItems.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <p>No updates yet. Be the first to share what you're working on!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nowboardItems.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 text-sm font-medium">
                    {item.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/90 text-sm font-medium">
                        {item.user?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-white/10 text-white/70 rounded-full">
                        {item.category}
                      </span>
                      <div className="ml-auto">
                        <NowboardMenu 
                          itemId={item.id} 
                          userId={item.userId} 
                          currentUserId={userId}
                        />
                      </div>
                    </div>
                    <p className="text-white/80 text-sm mb-2">{item.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50">
                        {formatDate(item.createdAt)}
                      </div>
                      {user && (
                        <InspiredButton
                          itemId={item.id}
                          userId={userId}
                          currentCount={item.inspiredCount || 0}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NeoGlassSection>
  );
}