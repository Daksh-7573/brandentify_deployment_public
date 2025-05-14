import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Filter, Loader2, Plus, Search, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function ContentManagementPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>("");
  const { toast } = useToast();
  
  const queryClient = useQueryClient();
  
  // Fetch content data from API using direct access endpoint
  const { 
    data: contentData, 
    isLoading: contentLoading, 
    error: contentError 
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
  
  const content = contentData?.content || [];
  
  // Filter content based on search term and selected filter
  const filteredContent = content;

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle content creation - using direct fetch instead of apiRequest
  const handleCreateContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/\s+/g, '-');
    const type = formData.get("newType") as "article" | "post" | "pulse" | "announcement";
    const excerpt = formData.get("excerpt") as string;
    const featuredImage = formData.get("featuredImage") as string;
    const status = formData.get("newStatus") as "published" | "draft" | "archived";
    const tags = newTag.split(",").map(tag => tag.trim()).filter(tag => tag !== "");
    
    // Check for required fields
    if (!title || !type) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          type,
          authorId: 1, // Default author ID
          status,
          excerpt,
          featuredImage,
          tags,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create content');
      }
      
      toast({
        title: "Content created",
        description: "Your content has been created successfully",
      });
      
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/direct/direct-content'] });
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error creating content",
        description: "There was an error creating your content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle content update - using direct fetch instead of apiRequest
  const handleUpdateContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!currentItem) return;
    
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const type = formData.get("type") as "article" | "post" | "pulse" | "announcement";
    const excerpt = formData.get("excerpt") as string;
    const featuredImage = formData.get("featuredImage") as string;
    const status = formData.get("status") as "published" | "draft" | "archived";
    
    try {
      const response = await fetch(`/api/admin/content/${currentItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type,
          excerpt,
          featuredImage,
          status,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update content');
      }
      
      toast({
        title: "Content updated",
        description: "Your content has been updated successfully",
      });
      
      setIsEditing(false);
      setCurrentItem(null);
      queryClient.invalidateQueries({ queryKey: ['/api/direct/direct-content'] });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error updating content",
        description: "There was an error updating your content. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle content deletion - using direct fetch instead of apiRequest
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
      
      toast({
        title: "Content deleted",
        description: "Your content has been deleted successfully",
      });
      
      setIsConfirmingDelete(false);
      setCurrentItem(null);
      queryClient.invalidateQueries({ queryKey: ['/api/direct/direct-content'] });
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error deleting content",
        description: "There was an error deleting your content. Please try again.",
        variant: "destructive",
      });
    }
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage your articles, posts, pulses, and announcements</CardDescription>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={16} className="mr-2" />
            Create Content
          </Button>
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
          </div>

          {/* Content Creation Dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateContent}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" placeholder="Enter title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (optional)</Label>
                      <Input id="slug" name="slug" placeholder="url-friendly-title" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newType">Type</Label>
                      <Select name="newType" defaultValue="article">
                        <SelectTrigger id="newType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">
                            Article
                          </SelectItem>
                          <SelectItem value="post">
                            Post
                          </SelectItem>
                          <SelectItem value="pulse">
                            Pulse
                          </SelectItem>
                          <SelectItem value="announcement">
                            Announcement
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newStatus">Status</Label>
                      <Select name="newStatus" defaultValue="draft">
                        <SelectTrigger id="newStatus">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea 
                      id="excerpt" 
                      name="excerpt" 
                      placeholder="Brief description of the content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input 
                      id="featuredImage" 
                      name="featuredImage" 
                      placeholder="https://example.com/image.jpg" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <div className="flex">
                      <Input 
                        id="tags" 
                        placeholder="technology, career, development" 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="ml-2"
                        onClick={() => setNewTag(prev => prev ? prev + ', ' : '')}
                      >
                        <Tag size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Content Edit Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Edit Content</DialogTitle>
              </DialogHeader>
              {currentItem && (
                <form onSubmit={handleUpdateContent}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input 
                          id="edit-title" 
                          name="title" 
                          defaultValue={currentItem.title} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-type">Type</Label>
                        <Select defaultValue={currentItem.type}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="post">Post</SelectItem>
                            <SelectItem value="pulse">Pulse</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select defaultValue={currentItem.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-featuredImage">Featured Image URL</Label>
                        <Input 
                          id="edit-featuredImage" 
                          name="featuredImage" 
                          defaultValue={currentItem.featuredImage} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-excerpt">Excerpt</Label>
                      <Textarea 
                        id="edit-excerpt" 
                        name="excerpt" 
                        defaultValue={currentItem.excerpt} 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsEditing(false);
                      setCurrentItem(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">Update</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this content? This action cannot be undone.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => currentItem && handleDelete(currentItem.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Content Table */}
          {contentLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading content...</span>
            </div>
          ) : contentError ? (
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No content found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{getContentTypeBadge(item.type)}</TableCell>
                        <TableCell>{getContentStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.author?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => {
                              setCurrentItem(item);
                              setIsEditing(true);
                            }}>
                            <Edit size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => {
                              setCurrentItem(item);
                              setIsConfirmingDelete(true);
                            }}
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredContent.length} of {content.length} items
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}