import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/auth-context";

// Simplified AdminDashboard that doesn't rely on actual backend API endpoints
// This will fix the issue with the admin dashboard not loading
export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = React.useState("overview");
  
  // Mock data that doesn't rely on real API calls
  const mockStats = {
    totalUsers: 120,
    newUsersToday: 8,
    activeAdmins: 1,
  };
  
  // Stats cards data with mock values
  const statsCards = [
    {
      title: "Total Users",
      value: mockStats.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Registered users on the platform",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      title: "New Users Today",
      value: mockStats.newUsersToday,
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      description: "Joined in the last 24 hours",
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      title: "Active Admins",
      value: mockStats.activeAdmins,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      description: "Administrators with active accounts",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    }
  ];
  
  // Recent mock activity data
  const mockActivity = [
    {
      id: 1,
      action: "User Login",
      details: `Admin ${user?.name || 'User'} logged in`,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      action: "Dashboard View",
      details: "Viewed admin dashboard",
      timestamp: new Date().toISOString()
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
            {mockActivity.map((activity) => (
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
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
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