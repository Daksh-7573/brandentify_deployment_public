import { useState, useEffect } from "react";
import AdminLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BarChart2, Users, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  activeAdmins: number;
  recentActivity: AdminActivity[];
}

interface AdminActivity {
  id: number;
  adminUserId: number;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  
  // Fetch admin stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return response.json();
    },
  });
  
  // Stats cards data
  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Registered users on the platform",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      title: "New Users Today",
      value: stats?.newUsersToday || 0,
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      description: "Joined in the last 24 hours",
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      title: "Active Admins",
      value: stats?.activeAdmins || 0,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      description: "Administrators with active accounts",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    }
  ];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };
  
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
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
                  {isLoading ? (
                    <Skeleton className="h-12 w-24" />
                  ) : (
                    <div className="text-3xl font-bold">
                      {card.value.toLocaleString()}
                    </div>
                  )}
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
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading activity data
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-2 hover:bg-muted/50 rounded-md">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Full Activity Log</CardTitle>
              <CardDescription>Complete history of administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* We'll implement the full activity log in a separate component */}
              <p className="text-muted-foreground text-center py-6">
                Full activity log will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </AdminLayout>
  );
}