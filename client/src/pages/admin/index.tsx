import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, AlertCircle, FileText
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// AdminDashboard connected to real backend API endpoints
export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = React.useState("overview");
  
  // Type definitions for API responses
  interface DashboardStats {
    totalUsers: number;
    newUsersToday: number;
    activeAdmins: number;
  }
  
  interface ActivityItem {
    id: number;
    action: string;
    details?: string;
    timestamp: string;
  }

  // Fetch dashboard stats from API
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats']
  });
  
  // Fetch recent activity from API
  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery<any>({
    queryKey: ['/api/admin/activity-log?limit=5']
  });
  
  // Transform activity data to match our expected format
  const transformedActivityData: ActivityItem[] = activityData?.logs?.map((log: any) => ({
    id: log.id,
    action: log.actionType,
    details: log.details,
    timestamp: log.createdAt
  })) || [];
  
  // Use real data when available, fallback to default values when loading
  const stats = statsData || {
    totalUsers: 0,
    newUsersToday: 0,
    activeAdmins: 0,
  };
  
  // Stats cards data with real values
  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Registered users on the platform",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      loading: statsLoading
    },
    {
      title: "New Users Today",
      value: stats.newUsersToday,
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      description: "Joined in the last 24 hours",
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      loading: statsLoading
    },
    {
      title: "Active Admins",
      value: stats.activeAdmins,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      description: "Administrators with active accounts",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      loading: statsLoading
    }
  ];
  
  // Use transformed activity data
  const activity = transformedActivityData;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };
  
  // No need for admin links since we have the sidebar

  // Create a content for the overview tab
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {card.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>Latest actions performed by administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLoading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-4 p-2">
                  <div className="p-2 rounded-full">
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <div className="w-full">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : activityError ? (
              // Show error state
              <div className="flex items-center justify-center py-6 text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>Error loading activity data</p>
              </div>
            ) : activity.length === 0 ? (
              // Show empty state
              <p className="text-muted-foreground text-center py-6">No recent activity to display</p>
            ) : (
              // Show actual activity data
              activity.map((item: ActivityItem) => (
                <div key={item.id} className="flex items-start space-x-4 p-2 hover:bg-muted/50 rounded-md">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.action}</p>
                    {item.details && (
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Create a content for the activity log tab
  const ActivityLogContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Full Activity Log</CardTitle>
          <CardDescription>Complete history of administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Full activity log will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewContent />
        </TabsContent>
        
        <TabsContent value="activity">
          <ActivityLogContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}