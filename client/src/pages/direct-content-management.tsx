import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Filter, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from '@/components/ui/pagination';

interface Author {
  id: number;
  name: string;
  username: string;
  photoURL: string | null;
}

interface ContentItem {
  id: number;
  title: string;
  slug: string;
  type: "article" | "post" | "pulse" | "announcement";
  excerpt: string;
  content?: string;
  featuredImage: string;
  authorId: number;
  author: Author;
  status: "published" | "draft" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface ContentListResponse {
  content: ContentItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function DirectContentManagementPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { toast } = useToast();

  // Fetch content data from API using direct access endpoint
  const { 
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<ContentListResponse>({
    queryKey: ['/api/direct/direct-content', page, limit, filter, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/direct/direct-content?page=${page}&limit=${limit}&filter=${filter}&search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      return response.json();
    },
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle search submit
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    refetch();
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Direct Content Management</CardTitle>
          <CardDescription>View all content items (direct access route for debugging)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter and Search */}
          <div className="flex flex-wrap gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search content..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <Select value={filter} onValueChange={(value) => {
              setFilter(value);
              setPage(1);
              setTimeout(() => refetch(), 0);
            }}>
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
          </div>

          {/* Content Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading content...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Failed to load content. Please try again.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No content found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.content.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.title || "Untitled"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getContentTypeBadge(item.type)}
                            </div>
                          </TableCell>
                          <TableCell>{getContentStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {item.author?.name || "Unknown"}
                          </TableCell>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                          <TableCell>
                            {item.publishedAt ? formatDate(item.publishedAt) : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of{" "}
                    {data.pagination.total} content items
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {data?.content ? `${data.content.length} item(s) displayed` : "No items to display"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}