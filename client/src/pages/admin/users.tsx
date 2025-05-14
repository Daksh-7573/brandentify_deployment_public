import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  EyeIcon, 
  Search, 
  MoreHorizontal,
  Shield,
  UserPlus,
  UserMinus,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  title?: string;
  location?: string;
  profileCompleted?: number;
  createdAt: string;
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);
  const { toast } = useToast();
  
  // Function to fetch users with pagination and search
  const fetchUsers = async () => {
    const response = await fetch(
      `/api/admin/users?page=${page}&limit=${limit}&search=${search}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    
    return response.json();
  };
  
  // Query for users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/users", page, limit, search],
    queryFn: fetchUsers
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium'
    }).format(date);
  };
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (data && data.pagination && page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted"
      });
      
      // Refresh users list
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the user",
        variant: "destructive"
      });
    }
  };
  
  return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and filters */}
            <form onSubmit={handleSearch} className="flex items-center mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">Search</Button>
            </form>
            
            {/* Users table */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 rounded-md">
                Error loading user data
              </div>
            ) : data?.users && data.users.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Location</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="hidden md:table-cell">Profile</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.users.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.title || "-"}</TableCell>
                          <TableCell className="hidden md:table-cell">{user.location || "-"}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {user.profileCompleted ? (
                              <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400">
                                {user.profileCompleted}% Complete
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400">
                                New
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="right" className="sm:max-w-lg">
                                <SheetHeader>
                                  <SheetTitle>User Profile</SheetTitle>
                                  <SheetDescription>
                                    View and manage user details
                                  </SheetDescription>
                                </SheetHeader>
                                <div className="py-6 space-y-6">
                                  <div className="flex items-center space-x-4">
                                    {user.profileCompleted ? (
                                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                        {user.name?.charAt(0) || user.username.charAt(0)}
                                      </div>
                                    ) : (
                                      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold">
                                        {user.name?.charAt(0) || user.username.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <h3 className="font-bold text-lg">{user.name || user.username}</h3>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                      {user.title && (
                                        <p className="text-sm">{user.title}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">User ID</h4>
                                      <p className="text-sm text-muted-foreground">{user.id}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Username</h4>
                                      <p className="text-sm text-muted-foreground">{user.username}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Location</h4>
                                      <p className="text-sm text-muted-foreground">{user.location || "Not specified"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Profile Completion</h4>
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div 
                                          className="bg-primary h-2.5 rounded-full" 
                                          style={{ width: `${user.profileCompleted || 0}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">{user.profileCompleted || 0}% Complete</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Account Created</h4>
                                      <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                                <SheetFooter>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" onClick={() => toast({ title: "Admin Role", description: "This feature will be available soon" })}>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Make Admin
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                                      <UserMinus className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                </SheetFooter>
                              </SheetContent>
                            </Sheet>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => toast({ title: "Admin Role", description: "This feature will be available soon" })}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteUser(user.id)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {data.users.length} of {data.pagination?.total || 0} users
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-4">
                      {page} / {data.pagination?.totalPages || 1}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={!data.pagination || page >= data.pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}