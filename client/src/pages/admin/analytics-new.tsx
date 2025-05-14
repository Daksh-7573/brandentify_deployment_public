import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  Users, Activity, TrendingUp, Calendar, Circle, ArrowUpRight, 
  ArrowDownRight, Download, RefreshCw, Filter, Loader2
} from "lucide-react";

// Colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFD'];

interface AnalyticsData {
  totalUsers: number;
  newUsers: number;
  totalContent: number;
  totalQuests: number;
  activeUsers: number;
  completedProfiles: number;
  userGrowth: { date: string; count: number }[];
  contentTypes: { type: string; count: number }[];
  recentActivity: {
    id: number;
    type: string;
    user: { id: number; name: string };
    timestamp: string;
    details: string;
  }[];
}

export default function AnalyticsNewPage() {
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        console.log('Fetching analytics data from direct API endpoint');
        
        const response = await fetch('/api/direct/direct-analytics');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics data: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Parse the text response manually
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Analytics data received:', data);
          setAnalyticsData(data);
          setError(null);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);
  
  // Calculate retention rate if possible
  const retentionRate = analyticsData ? Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100) : 0;
  
  // Calculate percent change for key metrics
  const userGrowth = analyticsData && analyticsData.userGrowth.length > 1 
    ? (((analyticsData.userGrowth[analyticsData.userGrowth.length - 1].count - 
          analyticsData.userGrowth[0].count) / 
          analyticsData.userGrowth[0].count) * 100).toFixed(1)
    : "0.0";
  
  const isUserGrowthPositive = parseFloat(userGrowth) >= 0;
  
  // Generate platform usage data based on user growth
  const generatePlatformUsageData = () => {
    if (!analyticsData || !analyticsData.userGrowth) return [];
    
    return analyticsData.userGrowth.slice(-7).map(day => {
      const total = day.count;
      const desktop = Math.floor(total * 0.5); // 50% desktop
      const mobile = Math.floor(total * 0.4);  // 40% mobile
      const tablet = total - desktop - mobile;  // remaining on tablet
      
      return {
        name: day.date.slice(5), // get just MM-DD
        desktop,
        mobile,
        tablet
      };
    });
  };
  
  // Generate engagement data based on user growth
  const generateEngagementData = () => {
    if (!analyticsData || !analyticsData.userGrowth) return [];
    
    return analyticsData.userGrowth.slice(-7).map(day => {
      const active = Math.floor(day.count * 0.6); // 60% active
      const returning = Math.floor(active * 0.7); // 70% of active are returning
      
      return {
        day: day.date.slice(5), // get just MM-DD
        active,
        returning
      };
    });
  };
  
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-lg">Loading analytics data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-xl text-center">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-lg">No analytics data available</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform performance and user engagement</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className={`flex items-center text-sm font-medium ${isUserGrowthPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isUserGrowthPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                <span>{userGrowth}%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</h3>
              <p className="text-muted-foreground text-sm">Total Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>8.2%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</h3>
              <p className="text-muted-foreground text-sm">Active Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="bg-amber-500/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>2.1%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{retentionRate}%</h3>
              <p className="text-muted-foreground text-sm">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>5.3%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{analyticsData.completedProfiles.toLocaleString()}</h3>
              <p className="text-muted-foreground text-sm">Completed Profiles</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* User Growth Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Daily user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.userGrowth}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                        name="Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Engagement Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Daily active vs returning users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateEngagementData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="active" fill="#8884d8" name="Active Users" />
                      <Bar dataKey="returning" fill="#82ca9d" name="Returning Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Content Types */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
                <CardDescription>Distribution by content category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.contentTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="type"
                      >
                        {analyticsData.contentTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Platform Usage */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>By device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={generatePlatformUsageData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTablet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="desktop" stroke="#8884d8" fillOpacity={1} fill="url(#colorDesktop)" />
                      <Area type="monotone" dataKey="tablet" stroke="#82ca9d" fillOpacity={1} fill="url(#colorTablet)" />
                      <Area type="monotone" dataKey="mobile" stroke="#ffc658" fillOpacity={1} fill="url(#colorMobile)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 gap-6 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>Latest actions from platform users</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className={`rounded-full w-10 h-10 flex items-center justify-center 
                        ${activity.type === 'user_registration' ? 'bg-green-100 text-green-700' : ''}
                        ${activity.type === 'profile_update' ? 'bg-blue-100 text-blue-700' : ''}
                        ${activity.type === 'quest_completed' ? 'bg-purple-100 text-purple-700' : ''}
                        ${activity.type === 'content_created' ? 'bg-amber-100 text-amber-700' : ''}
                        ${activity.type === 'system_update' ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {activity.type === 'user_registration' && <Users className="h-5 w-5" />}
                        {activity.type === 'profile_update' && <Activity className="h-5 w-5" />}
                        {activity.type === 'quest_completed' && <TrendingUp className="h-5 w-5" />}
                        {activity.type === 'content_created' && <Circle className="h-5 w-5" />}
                        {activity.type === 'system_update' && <Calendar className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.details}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          By: {activity.user.name} (ID: {activity.user.id})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quest Completion Rates</CardTitle>
                <CardDescription>Percentage of assigned quests completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { quest: 'Profile Creator', assigned: 120, completed: 98 },
                        { quest: 'Skill Master', assigned: 100, completed: 76 },
                        { quest: 'Pulse Maker', assigned: 95, completed: 67 },
                        { quest: 'Mentor Connect', assigned: 80, completed: 45 },
                        { quest: 'Comment Wizard', assigned: 110, completed: 82 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quest" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="assigned" fill="#8884d8" name="Assigned" />
                      <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Active Users</CardTitle>
                <CardDescription>Active user count by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', mau: Math.floor(analyticsData.totalUsers * 0.5) },
                        { month: 'Feb', mau: Math.floor(analyticsData.totalUsers * 0.55) },
                        { month: 'Mar', mau: Math.floor(analyticsData.totalUsers * 0.6) },
                        { month: 'Apr', mau: Math.floor(analyticsData.totalUsers * 0.65) },
                        { month: 'May', mau: analyticsData.activeUsers }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="mau" stroke="#8884d8" name="Monthly Active Users" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="grid grid-cols-1 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Views, engagement and shares by content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Resume Builder', views: analyticsData.totalUsers * 2, engagement: 42, shares: 15 },
                        { name: 'Career Capsule', views: analyticsData.totalUsers * 1.5, engagement: 38, shares: 10 },
                        { name: 'Mentorship', views: analyticsData.totalUsers * 1.2, engagement: 35, shares: 8 },
                        { name: 'Quests', views: analyticsData.totalUsers * 1.8, engagement: 32, shares: 12 },
                        { name: 'Shadow Resume', views: analyticsData.totalUsers * 1.0, engagement: 30, shares: 5 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Views" />
                      <Bar yAxisId="right" dataKey="shares" fill="#82ca9d" name="Shares" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}