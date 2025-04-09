import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '../hooks/use-toast';
import Header from '../components/layout/header';
import { Loader2, CirclePlus, Trash2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

// News Source interface
interface NewsSource {
  id: number;
  name: string;
  url: string;
  description: string | null;
  apiKey: string | null;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form data interface
interface NewsSourceFormData {
  name: string;
  url: string;
  description: string;
  apiKey: string;
  category: string;
  isActive: boolean;
}

function NewsSourcesPage() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [formData, setFormData] = useState<NewsSourceFormData>({
    name: '',
    url: '',
    description: '',
    apiKey: '',
    category: 'technology',
    isActive: true
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch news sources
  const { 
    data: newsSources,
    isLoading: isLoadingSources, 
    isError: isSourcesError 
  } = useQuery({
    queryKey: ['/api/news-sources'],
    refetchOnWindowFocus: false
  });
  
  // Create news source mutation
  const createSourceMutation = useMutation({
    mutationFn: (source: NewsSourceFormData) => {
      return apiRequest('/api/news-sources', { 
        method: 'POST', 
        data: source 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news-sources'] });
      setIsAddSourceOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "News source added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add news source. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating news source:", error);
    }
  });
  
  // Delete news source mutation
  const deleteSourceMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/news-sources/${id}`, { 
        method: 'DELETE' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news-sources'] });
      toast({
        title: "Success",
        description: "News source deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete news source",
        variant: "destructive"
      });
      console.error("Error deleting news source:", error);
    }
  });
  
  // Update news source active status mutation
  const toggleSourceActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => {
      return apiRequest(`/api/news-sources/${id}`, { 
        method: 'PUT',
        data: { isActive }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news-sources'] });
      toast({
        title: "Success",
        description: "News source updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update news source",
        variant: "destructive"
      });
      console.error("Error updating news source:", error);
    }
  });
  
  // Fetch news from all sources
  const fetchNewsMutation = useMutation({
    mutationFn: () => {
      return apiRequest('/api/news/fetch', { 
        method: 'POST' 
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `News fetch completed. ${data.result || 'Articles processed.'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to fetch news",
        variant: "destructive"
      });
      console.error("Error fetching news:", error);
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSourceMutation.mutate(formData);
  };
  
  // Handle delete news source
  const handleDeleteSource = (id: number) => {
    if (confirm("Are you sure you want to delete this news source?")) {
      deleteSourceMutation.mutate(id);
    }
  };
  
  // Handle toggle active status
  const handleToggleActive = (id: number, currentStatus: boolean) => {
    toggleSourceActiveMutation.mutate({ 
      id, 
      isActive: !currentStatus 
    });
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      apiKey: '',
      category: 'technology',
      isActive: true
    });
  };
  
  // Handle fetch news
  const handleFetchNews = () => {
    fetchNewsMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">News Sources Management</h1>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleFetchNews}
              disabled={fetchNewsMutation.isPending}
              className="flex items-center gap-2"
            >
              {fetchNewsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Fetch News Now
            </Button>
            
            <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <CirclePlus className="h-4 w-4" />
                  Add News Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add News Source</DialogTitle>
                  <DialogDescription>
                    Add a new news source to fetch industry news.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Tech Daily News"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="url">API URL</Label>
                    <Input
                      id="url"
                      name="url"
                      placeholder="e.g. https://newsapi.org"
                      value={formData.url}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Supported APIs: NewsAPI.org, GNews.io
                    </p>
                  </div>
                  
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      placeholder="Your API key"
                      value={formData.apiKey}
                      onChange={handleInputChange}
                      required
                      type="password"
                    />
                  </div>
                  
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Description of this news source"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddSourceOpen(false)} 
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSourceMutation.isPending}
                    >
                      {createSourceMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Add Source
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoadingSources ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isSourcesError ? (
          <div className="text-center text-red-500 py-10">
            Error loading news sources. Please try again.
          </div>
        ) : newsSources?.length === 0 ? (
          <div className="text-center py-10">
            <p>No news sources found. Add your first news source to start fetching industry news.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsSources?.map((source: NewsSource) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(source.id, source.isActive)}
                        className={`${source.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSource(source.id)}
                        className="h-6 w-6 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{source.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">URL:</span> {source.url}
                    </div>
                    {source.description && (
                      <div className="text-sm">
                        <span className="font-semibold">Description:</span> {source.description}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-semibold">API Key:</span> {source.apiKey ? '••••••••' : 'Not set'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-gray-500">
                  Added on {new Date(source.createdAt).toLocaleDateString()}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">News Fetching Status</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Last Fetched:</h3>
                  <p>Not available</p>
                </div>
                <div>
                  <h3 className="font-medium">Status:</h3>
                  <p>Click "Fetch News Now" to manually trigger the news fetch process.</p>
                </div>
                <div>
                  <h3 className="font-medium">Note:</h3>
                  <p className="text-sm text-gray-600">
                    News are automatically fetched based on user preferences. You can manually
                    trigger a fetch to get the latest news immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default NewsSourcesPage;