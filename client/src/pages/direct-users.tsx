import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, Search, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  title: string | null;
  location: string | null;
  createdAt: string;
}

interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function DirectUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { toast } = useToast();

  // Query for fetching users
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<UserListResponse>({
    queryKey: ['/api/direct/direct-users', page, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(
        `/api/direct/direct-users?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching users:", errorData);
        throw new Error(errorData.message || "Failed to fetch users");
      }
      return response.json();
    },
  });

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Direct User Management</CardTitle>
          <CardDescription>View and manage all users (direct access route for debugging)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by name, email, or username..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Failed to load users. Please try again.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <UserRound className="h-4 w-4 mr-2 text-gray-400" />
                              {user.name || "—"}
                            </div>
                          </TableCell>
                          <TableCell>{user.email || "—"}</TableCell>
                          <TableCell>{user.username || "—"}</TableCell>
                          <TableCell>{user.title || "—"}</TableCell>
                          <TableCell>{user.location || "—"}</TableCell>
                          <TableCell>{user.createdAt ? formatDate(user.createdAt) : "—"}</TableCell>
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
                    {data.pagination.total} users
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
      </Card>
    </div>
  );
}