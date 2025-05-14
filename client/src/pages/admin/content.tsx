import { useState } from "react";
import AdminLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellRing, FileText, MessageSquare, Trash2, User, Edit, Plus, Eye, MoreHorizontal, Filter, AlertCircle, Loader2, Image as ImageIcon, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

// Types for content items and author
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
  featuredImage: string;
  authorId: number;
  author: Author;
  status: "published" | "draft" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Fetch content data from API instead of using mock data

export default function ContentManagementPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch content data from API (using public endpoint for testing)
  const { 
    data: contentData, 
    isLoading: contentLoading, 
    error: contentError 
  } = useQuery({
    queryKey: ['/api/admin/public/content'],
    queryFn: () => apiRequest('/api/admin/public/content')
  });
  
  // Use real data when available
  const content = contentData?.content || [];
  
  // Filter content based on selected type and search query
  const filteredContent = content.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.author?.name && item.author.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });
  
  // Helper to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Delete content item mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/content/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      // Invalidate and refetch content data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Content Deleted",
        description: "The content has been successfully removed.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle delete content
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  // Edit content item mutation
  const editMutation = useMutation({
    mutationFn: (data: Partial<ContentItem>) => 
      apiRequest(`/api/admin/content/${data.id}`, { 
        method: 'PUT',
        body: JSON.stringify(data) 
      }),
    onSuccess: () => {
      // Invalidate and refetch content data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setIsEditing(false);
      setCurrentItem(null);
      toast({
        title: "Changes Saved",
        description: "Content has been updated successfully.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle edit content form submission
  const handleEditSave = () => {
    if (!currentItem) return;
    
    // Get form data from the form elements
    const formData = {
      id: currentItem.id,
      title: (document.querySelector('input[name="title"]') as HTMLInputElement)?.value,
      slug: (document.querySelector('input[name="slug"]') as HTMLInputElement)?.value,
      type: (document.querySelector('select[name="type"]') as HTMLSelectElement)?.value as "article" | "post" | "pulse" | "announcement",
      status: (document.querySelector('select[name="status"]') as HTMLSelectElement)?.value as "published" | "draft" | "archived",
      excerpt: (document.querySelector('textarea[name="excerpt"]') as HTMLTextAreaElement)?.value,
      featuredImage: (document.querySelector('input[name="featuredImage"]') as HTMLInputElement)?.value
    };
    
    editMutation.mutate(formData);
  };
  
  // Create new content mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest('/api/admin/content', { 
        method: 'POST',
        body: JSON.stringify(data) 
      }),
    onSuccess: () => {
      // Invalidate and refetch content data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Content Created",
        description: "New content has been created successfully.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error("Error creating content:", error);
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle create content form submission
  const handleCreateContent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
    const newContent = {
      title: (form.querySelector('input[name="newTitle"]') as HTMLInputElement)?.value,
      type: (form.querySelector('select[name="newType"]') as HTMLSelectElement)?.value as "article" | "post" | "pulse",
      author: (form.querySelector('input[name="newAuthor"]') as HTMLInputElement)?.value,
      status: (form.querySelector('select[name="newStatus"]') as HTMLSelectElement)?.value as "published" | "draft" | "archived",
      featured: (form.querySelector('input[name="newFeatured"]') as HTMLInputElement)?.checked
    };
    
    createMutation.mutate(newContent);
    form.reset();
  };
  
  // Create content dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">Manage all content across the platform</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus size={16} />
                Create New Content
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Create New Content</SheetTitle>
                <SheetDescription>
                  Add a new content item to the platform.
                </SheetDescription>
              </SheetHeader>
              
              <form onSubmit={handleCreateContent} className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newTitle">Title</Label>
                  <Input id="newTitle" name="newTitle" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newSlug">Slug</Label>
                  <Input id="newSlug" name="newSlug" required placeholder="content-url-slug" />
                  <p className="text-xs text-muted-foreground">URL-friendly version of the title (e.g., "my-article-title")</p>
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
                          <div className="flex items-center">
                            <FileText size={14} className="mr-2" />
                            Article
                          </div>
                        </SelectItem>
                        <SelectItem value="post">
                          <div className="flex items-center">
                            <MessageSquare size={14} className="mr-2" />
                            Post
                          </div>
                        </SelectItem>
                        <SelectItem value="pulse">
                          <div className="flex items-center">
                            <BellRing size={14} className="mr-2" />
                            Pulse
                          </div>
                        </SelectItem>
                        <SelectItem value="announcement">
                          <div className="flex items-center">
                            <AlertCircle size={14} className="mr-2" />
                            Announcement
                          </div>
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
                  <Label htmlFor="newAuthorId">Author ID</Label>
                  <Input id="newAuthorId" name="newAuthorId" type="number" required placeholder="1" />
                  <p className="text-xs text-muted-foreground">User ID of the content author</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newTags">Tags</Label>
                  <Input id="newTags" name="newTags" placeholder="tag1, tag2, tag3" />
                  <p className="text-xs text-muted-foreground">Comma-separated list of tags</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newExcerpt">Excerpt</Label>
                  <Textarea 
                    id="newExcerpt"
                    name="newExcerpt"
                    placeholder="Brief summary of the content..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newFeaturedImage">Featured Image URL</Label>
                  <Input 
                    id="newFeaturedImage"
                    name="newFeaturedImage"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create Content"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4 flex-col sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search content by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
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
                <Button variant="outline">
                  <Filter size={16} className="mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Items</CardTitle>
            <CardDescription>
              {contentLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : contentError ? (
                "Error loading items"
              ) : (
                `${filteredContent.length} items found`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Author</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Last Updated</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentLoading ? (
                    // Loading skeleton
                    Array.from({length: 5}).map((_, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-36" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : contentError ? (
                    // Error state
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-destructive">
                          <AlertCircle size={24} className="mb-2" />
                          <p>Error loading content. Please try again.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => queryClient.invalidateQueries({queryKey: ['/api/admin/content']})}>
                            Retry
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredContent.length === 0 ? (
                    // Empty state
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <p className="text-muted-foreground">No content items found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    // Content loaded successfully
                    filteredContent.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.slug}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="font-normal">
                            {item.type === "article" ? <FileText size={12} className="mr-1" /> : 
                             item.type === "post" ? <MessageSquare size={12} className="mr-1" /> : 
                             item.type === "pulse" ? <BellRing size={12} className="mr-1" /> :
                             <AlertCircle size={12} className="mr-1" />}
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <User size={14} className="mr-1 text-muted-foreground" />
                            {item.author?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              item.status === "published" ? "default" : 
                              item.status === "draft" ? "outline" : 
                              "secondary"
                            }
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(item.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setCurrentItem(item);
                                    setIsEditing(false);
                                  }}
                                >
                                  <Eye size={16} />
                                  <span className="sr-only">View</span>
                                </Button>
                              </SheetTrigger>
                            <SheetContent className="sm:max-w-xl">
                              <SheetHeader>
                                <SheetTitle>{isEditing ? "Edit Content" : "Content Details"}</SheetTitle>
                                <SheetDescription>
                                  {isEditing 
                                    ? "Make changes to the content item." 
                                    : "View details for this content item."}
                                </SheetDescription>
                              </SheetHeader>
                              
                              {currentItem && (
                                <div className="mt-6 space-y-6">
                                  <div className="space-y-2">
                                    <Label>Title</Label>
                                    {isEditing ? (
                                      <Input defaultValue={currentItem.title} />
                                    ) : (
                                      <div className="p-2 border rounded-md">{currentItem.title}</div>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Type</Label>
                                      {isEditing ? (
                                        <Select defaultValue={currentItem.type}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="article">Article</SelectItem>
                                            <SelectItem value="post">Post</SelectItem>
                                            <SelectItem value="pulse">Pulse</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <div className="p-2 border rounded-md capitalize">{currentItem.type}</div>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Status</Label>
                                      {isEditing ? (
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
                                      ) : (
                                        <div className="p-2 border rounded-md capitalize">{currentItem.status}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Slug</Label>
                                    {isEditing ? (
                                      <Input 
                                        name="slug"
                                        defaultValue={currentItem.slug} 
                                      />
                                    ) : (
                                      <div className="p-2 border rounded-md">{currentItem.slug}</div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Author</Label>
                                    <div className="p-2 border rounded-md">
                                      {currentItem.author?.name || 'Unknown'} 
                                      {currentItem.author?.username && 
                                        <span className="text-xs text-muted-foreground ml-2">(@{currentItem.author.username})</span>
                                      }
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="p-2 border rounded-md">
                                      <div className="flex flex-wrap gap-2">
                                        {currentItem.tags && currentItem.tags.length > 0 ? (
                                          currentItem.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                              <Tag size={12} className="mr-1" />
                                              {tag}
                                            </Badge>
                                          ))
                                        ) : (
                                          <div className="text-sm text-muted-foreground">No tags</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Excerpt</Label>
                                    {isEditing ? (
                                      <Textarea 
                                        name="excerpt"
                                        defaultValue={currentItem.excerpt} 
                                      />
                                    ) : (
                                      <div className="p-2 border rounded-md">
                                        {currentItem.excerpt || 'No excerpt available'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Featured Image</Label>
                                    {isEditing ? (
                                      <Input 
                                        name="featuredImage"
                                        defaultValue={currentItem.featuredImage} 
                                      />
                                    ) : (
                                      <div className="border rounded-md overflow-hidden">
                                        {currentItem.featuredImage ? (
                                          <img 
                                            src={currentItem.featuredImage} 
                                            alt={currentItem.title}
                                            className="w-full h-40 object-cover"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center h-40 bg-muted">
                                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <Label>Created</Label>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(currentItem.createdAt)}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <Label>Last Updated</Label>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(currentItem.updatedAt)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between pt-4">
                                    {isEditing ? (
                                      <>
                                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                                          Cancel
                                        </Button>
                                        <Button onClick={handleEditSave}>
                                          Save Changes
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button 
                                          variant="destructive" 
                                          className="flex items-center gap-2"
                                          onClick={() => {
                                            handleDelete(currentItem.id);
                                          }}
                                        >
                                          <Trash2 size={16} />
                                          Delete
                                        </Button>
                                        <Button 
                                          variant="default" 
                                          className="flex items-center gap-2"
                                          onClick={() => setIsEditing(true)}
                                        >
                                          <Edit size={16} />
                                          Edit
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
                          
                          <Button size="sm" variant="ghost" onClick={() => setCurrentItem(item)}>
                            <Edit size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </AdminLayout>
  );
}