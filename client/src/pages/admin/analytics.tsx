import { useState } from "react";
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
  ArrowDownRight, Download, RefreshCw, Filter
} from "lucide-react";

// Mock data for demonstration purposes
const userGrowthData = [
  { month: 'Jan', users: 320 },
  { month: 'Feb', users: 480 },
  { month: 'Mar', users: 550 },
  { month: 'Apr', users: 620 },
  { month: 'May', users: 790 },
  { month: 'Jun', users: 920 },
  { month: 'Jul', users: 1100 },
];

const engagementData = [
  { day: 'Mon', active: 340, returning: 230 },
  { day: 'Tue', active: 380, returning: 250 },
  { day: 'Wed', active: 450, returning: 290 },
  { day: 'Thu', active: 410, returning: 300 },
  { day: 'Fri', active: 390, returning: 260 },
  { day: 'Sat', active: 280, returning: 180 },
  { day: 'Sun', active: 320, returning: 220 },
];

const trafficSourceData = [
  { name: 'Direct', value: 35 },
  { name: 'Social', value: 25 },
  { name: 'Search', value: 20 },
  { name: 'Referral', value: 15 },
  { name: 'Other', value: 5 },
];

const contentPerformanceData = [
  { name: 'Resume Builder', views: 5200, engagement: 42, shares: 120 },
  { name: 'Career Capsule', views: 4800, engagement: 38, shares: 95 },
  { name: 'Mentorship', views: 3900, engagement: 35, shares: 85 },
  { name: 'Quests', views: 3600, engagement: 32, shares: 70 },
  { name: 'Shadow Resume', views: 3200, engagement: 30, shares: 65 },
];

const platformUsageData = [
  { name: 'Mon', desktop: 230, tablet: 110, mobile: 180 },
  { name: 'Tue', desktop: 250, tablet: 130, mobile: 210 },
  { name: 'Wed', desktop: 270, tablet: 120, mobile: 240 },
  { name: 'Thu', desktop: 260, tablet: 140, mobile: 230 },
  { name: 'Fri', desktop: 240, tablet: 120, mobile: 220 },
  { name: 'Sat', desktop: 190, tablet: 90, mobile: 180 },
  { name: 'Sun', desktop: 200, tablet: 100, mobile: 190 },
];

// Colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFD'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7days");
  
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
            
            <Button variant="ghost" size="icon">
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
                <div className="flex items-center text-sm font-medium text-green-500">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>12.5%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold">3,721</h3>
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
                <h3 className="text-2xl font-bold">1,245</h3>
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
                <div className="flex items-center text-sm font-medium text-red-500">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>3.1%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold">68.4%</h3>
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
                <h3 className="text-2xl font-bold">27 min</h3>
                <p className="text-muted-foreground text-sm">Avg. Session Time</p>
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
                  <CardDescription>Monthly user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowthData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorUsers)" 
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
                      <BarChart data={engagementData}>
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
              
              {/* Traffic Sources */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where users are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {trafficSourceData.map((entry, index) => (
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
                        data={platformUsageData}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader>
                  <CardTitle>Demographic Breakdown</CardTitle>
                  <CardDescription>User statistics by age group and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { age: '18-24', male: 210, female: 240, other: 30 },
                          { age: '25-34', male: 380, female: 420, other: 40 },
                          { age: '35-44', male: 280, female: 310, other: 25 },
                          { age: '45-54', male: 190, female: 230, other: 20 },
                          { age: '55-64', male: 130, female: 150, other: 15 },
                          { age: '65+', male: 70, female: 90, other: 10 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="male" fill="#3b82f6" name="Male" />
                        <Bar dataKey="female" fill="#ec4899" name="Female" />
                        <Bar dataKey="other" fill="#8b5cf6" name="Other" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Retention</CardTitle>
                  <CardDescription>Weekly cohort analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground p-8">
                    <p>Detailed cohort analysis data would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Satisfaction</CardTitle>
                  <CardDescription>NPS and feedback metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground p-8">
                    <p>NPS and satisfaction metrics would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Feature Usage</CardTitle>
                      <CardDescription>Most popular platform features</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'Resume Builder', value: 82 },
                          { name: 'Career Capsule', value: 74 },
                          { name: 'Quests', value: 68 },
                          { name: 'Mentorship Connect', value: 63 },
                          { name: 'Shadow Resume', value: 57 },
                          { name: 'Timeline Editor', value: 52 },
                          { name: 'Skill Assessment', value: 48 },
                          { name: 'Messaging', value: 45 },
                          { name: 'Industry Pulse', value: 41 },
                          { name: 'Profile Editor', value: 38 }
                        ]}
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip 
                          formatter={(value) => [`${value}% of users`, 'Usage']}
                        />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Journey</CardTitle>
                  <CardDescription>Path analysis through the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground p-8">
                    <p>User journey flow visualization would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Times</CardTitle>
                  <CardDescription>Average time spent by feature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Resume Builder', time: 14.2 },
                          { name: 'Career Capsule', time: 11.8 },
                          { name: 'Mentorship', time: 9.5 },
                          { name: 'Quests', time: 8.3 },
                          { name: 'Shadow Resume', time: 7.1 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value} mins`, 'Avg Time']} />
                        <Bar dataKey="time" fill="#82ca9d" />
                      </BarChart>
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
                  <CardDescription>Views, engagement, and sharing metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={contentPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Views" />
                        <Bar yAxisId="left" dataKey="shares" fill="#ffc658" name="Shares" />
                        <Bar yAxisId="right" dataKey="engagement" fill="#82ca9d" name="Engagement %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Content</CardTitle>
                  <CardDescription>Most viewed and engaged content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Content Title</th>
                          <th className="text-right py-3 px-4">Views</th>
                          <th className="text-right py-3 px-4">Engagement</th>
                          <th className="text-right py-3 px-4">Shares</th>
                          <th className="text-right py-3 px-4">Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">10 Resume Tips for Tech Professionals</td>
                          <td className="py-3 px-4 text-right">8,453</td>
                          <td className="py-3 px-4 text-right">72%</td>
                          <td className="py-3 px-4 text-right">342</td>
                          <td className="py-3 px-4 text-right">18.7%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">How to Prepare for a Technical Interview</td>
                          <td className="py-3 px-4 text-right">7,128</td>
                          <td className="py-3 px-4 text-right">68%</td>
                          <td className="py-3 px-4 text-right">287</td>
                          <td className="py-3 px-4 text-right">15.4%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Career Switching: A Complete Guide</td>
                          <td className="py-3 px-4 text-right">6,875</td>
                          <td className="py-3 px-4 text-right">65%</td>
                          <td className="py-3 px-4 text-right">264</td>
                          <td className="py-3 px-4 text-right">14.2%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Networking for Introverts</td>
                          <td className="py-3 px-4 text-right">5,932</td>
                          <td className="py-3 px-4 text-right">61%</td>
                          <td className="py-3 px-4 text-right">219</td>
                          <td className="py-3 px-4 text-right">12.8%</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="py-3 px-4">Salary Negotiation Tactics That Work</td>
                          <td className="py-3 px-4 text-right">5,487</td>
                          <td className="py-3 px-4 text-right">58%</td>
                          <td className="py-3 px-4 text-right">198</td>
                          <td className="py-3 px-4 text-right">11.5%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}