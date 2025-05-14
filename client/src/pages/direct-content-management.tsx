import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  Search, 
  Plus, 
  Loader2, 
  FileText,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";

// Basic content management page for direct access (bypasses admin authentication)
export default function DirectContentManagementPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [_, navigate] = useLocation();
  
  // Fetch content from direct-access API endpoint
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/direct/direct-content', filter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== "all") params.append('filter', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/direct/direct-content?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      return response.json();
    }
  });
  
  const contentItems = data?.content || [];
  const totalItems = data?.pagination?.total || 0;
  const currentPage = data?.pagination?.page || 1;
  const totalPages = data?.pagination?.totalPages || 1;
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get content type badge
  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case 'article':
        return <Badge className="bg-blue-500">Article</Badge>;
      case 'post':
        return <Badge variant="outline">Post</Badge>;
      case 'pulse':
        return <Badge variant="secondary">Pulse</Badge>;
      case 'announcement':
        return <Badge className="bg-purple-500">Announcement</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  // Get content status badge
  const getContentStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Content Management</CardTitle>
              <CardDescription>Manage all content items in one place</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or content..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="pulse">Pulses</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => {
                // Viewing only, so this would normally create a new content item
                alert("Create functionality is not implemented in this view");
              }}
            >
              <Plus size={16} />
              New Content
            </Button>
          </div>
          
          {/* Content Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading content...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-destructive">
              <p>Failed to load content. Please try again later.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  // Reset filters and retry
                  setFilter("all");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No content found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contentItems.map((item: any) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2 text-muted-foreground" />
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>{getContentTypeBadge(item.type)}</TableCell>
                        <TableCell>{getContentStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.author?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-6">
          <div className="text-sm text-muted-foreground">
            {totalItems > 0 && (
              <span>
                Showing {contentItems.length} of {totalItems} items
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage <= 1}
              onClick={() => {
                // Would normally handle pagination
                // Not implemented in this simplified view
              }}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage >= totalPages}
              onClick={() => {
                // Would normally handle pagination
                // Not implemented in this simplified view
              }}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}