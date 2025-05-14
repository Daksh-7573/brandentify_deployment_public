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
import { BellRing, FileText, MessageSquare, Trash2, User, Edit, Plus, Eye, MoreHorizontal, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Types for content items
interface ContentItem {
  id: number;
  title: string;
  type: "post" | "article" | "pulse";
  author: string;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

// Mock data for demonstration
const mockContent: ContentItem[] = [
  {
    id: 1,
    title: "Introduction to Brandentifier",
    type: "article",
    author: "Admin User",
    status: "published",
    createdAt: "2025-05-12T09:30:00Z",
    updatedAt: "2025-05-12T10:45:00Z",
    featured: true
  },
  {
    id: 2,
    title: "New UI Features Released",
    type: "post",
    author: "Marketing Team",
    status: "published",
    createdAt: "2025-05-11T14:22:00Z",
    updatedAt: "2025-05-11T15:30:00Z",
    featured: false
  },
  {
    id: 3,
    title: "Upcoming Webinar Announcement",
    type: "pulse",
    author: "Events Manager",
    status: "draft",
    createdAt: "2025-05-10T11:15:00Z",
    updatedAt: "2025-05-10T11:15:00Z",
    featured: false
  },
  {
    id: 4,
    title: "Career Growth Strategies",
    type: "article",
    author: "Career Expert",
    status: "published",
    createdAt: "2025-05-09T08:45:00Z",
    updatedAt: "2025-05-09T16:20:00Z",
    featured: true
  },
  {
    id: 5,
    title: "Platform Maintenance Notice",
    type: "post",
    author: "System Admin",
    status: "archived",
    createdAt: "2025-05-08T17:30:00Z",
    updatedAt: "2025-05-08T18:15:00Z",
    featured: false
  }
];

export default function ContentManagementPage() {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filter content based on selected type and search query
  const filteredContent = content.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
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
  
  // Delete content item
  const handleDelete = (id: number) => {
    // In a real implementation, this would make an API call
    setContent(prevContent => prevContent.filter(item => item.id !== id));
    toast({
      title: "Content Deleted",
      description: "The content has been successfully removed.",
      variant: "default"
    });
  };
  
  // Edit content item (in a real implementation, this would update the item)
  const handleEditSave = () => {
    setIsEditing(false);
    toast({
      title: "Changes Saved",
      description: "Content has been updated successfully.",
      variant: "default"
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">Manage all content across the platform</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Create New Content
          </Button>
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
              {filteredContent.length} items found
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
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{item.title}</div>
                        {item.featured && <Badge className="mt-1">Featured</Badge>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={item.type === 'article' ? 'default' : 
                                        item.type === 'post' ? 'secondary' : 'outline'}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{item.author}</td>
                      <td className="py-3 px-4">
                        <Badge variant={item.status === 'published' ? 'success' : 
                                       item.status === 'draft' ? 'outline' : 'destructive'}>
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
                                    <Label>Author</Label>
                                    {isEditing ? (
                                      <Input defaultValue={currentItem.author} />
                                    ) : (
                                      <div className="p-2 border rounded-md">{currentItem.author}</div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Featured Content</Label>
                                      {isEditing ? (
                                        <Switch defaultChecked={currentItem.featured} />
                                      ) : (
                                        <Badge variant={currentItem.featured ? "default" : "outline"}>
                                          {currentItem.featured ? "Featured" : "Not Featured"}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Content Body</Label>
                                    {isEditing ? (
                                      <Textarea 
                                        defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula."
                                        className="min-h-[150px]"
                                      />
                                    ) : (
                                      <div className="p-2 border rounded-md min-h-[150px] text-muted-foreground">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
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