import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContentSimplePage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch content data from API
  const { 
    data, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/direct/direct-content', filter, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/direct/direct-content?filter=${filter}&search=${searchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      return response.json();
    }
  });
  
  const contentItems = data?.content || [];

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
        return <Badge>Article</Badge>;
      case 'post':
        return <Badge variant="outline">Post</Badge>;
      case 'pulse':
        return <Badge variant="secondary">Pulse</Badge>;
      case 'announcement':
        return <Badge variant="destructive">Announcement</Badge>;
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
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management (Simple View)</CardTitle>
          <CardDescription>View all content items in a simplified interface</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter and Search */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => {
              // Just a search button that retriggers the query
            }}>
              Search
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
                        No content found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contentItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
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
      </Card>
    </div>
  );
}