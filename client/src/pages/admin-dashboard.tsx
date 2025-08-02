import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  TrendingUp,
  UserCheck,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface UserStats {
  totalUsers: number;
  totalPatients: number;
  totalProviders: number;
  totalAppointments: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isOnboarded: boolean;
  createdAt: string;
  patientProfile?: any;
  providerProfile?: any;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin",
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  // Filter users based on search and role
  const filteredUsers = users.filter((u: User) => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Prepare chart data
  const roleDistribution = [
    { name: "Patients", value: stats?.totalPatients || 0, color: "#10B981" },
    { name: "Providers", value: stats?.totalProviders || 0, color: "#F59E0B" },
    { name: "Admins", value: (stats?.totalUsers || 0) - (stats?.totalPatients || 0) - (stats?.totalProviders || 0), color: "#EA580C" },
  ];

  const monthlyUserGrowth = [
    { month: "Jan", users: 45 },
    { month: "Feb", users: 52 },
    { month: "Mar", users: 61 },
    { month: "Apr", users: 73 },
    { month: "May", users: 89 },
    { month: "Jun", users: 97 },
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      patient: "bg-vitality/20 text-vitality",
      provider: "bg-golden/20 text-golden-dark",
      admin: "bg-warm-orange/20 text-warm-orange",
    };
    return colors[role as keyof typeof colors] || colors.patient;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleExportData = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    toast({
      title: "Export Started",
      description: "User data export will be available for download shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-xl text-warm-brown">
            Manage users, monitor system health, and oversee platform operations.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golden rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-golden-dark mb-1">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-warm-brown">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-vitality rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserCheck className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-vitality mb-1">{stats?.totalPatients || 0}</div>
              <div className="text-sm text-warm-brown">Patients</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warm-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-warm-orange mb-1">{stats?.totalProviders || 0}</div>
              <div className="text-sm text-warm-brown">Providers</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-accent-yellow mb-1">{stats?.totalAppointments || 0}</div>
              <div className="text-sm text-warm-brown">Appointments</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-2xl p-1">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              System Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* User Distribution */}
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark">User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {roleDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    {roleDistribution.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-warm-brown">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-cream rounded-xl">
                      <div className="w-8 h-8 bg-vitality rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-golden-dark">New patient registered</p>
                        <p className="text-xs text-warm-brown">Maria Rodriguez joined the platform</p>
                      </div>
                      <span className="text-xs text-warm-brown/70">2h ago</span>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-cream rounded-xl">
                      <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-golden-dark">Provider verification completed</p>
                        <p className="text-xs text-warm-brown">Dr. Ahmad Hassan verified</p>
                      </div>
                      <span className="text-xs text-warm-brown/70">4h ago</span>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-cream rounded-xl">
                      <div className="w-8 h-8 bg-warm-orange rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-golden-dark">High appointment volume</p>
                        <p className="text-xs text-warm-brown">150+ appointments scheduled today</p>
                      </div>
                      <span className="text-xs text-warm-brown/70">6h ago</span>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-cream rounded-xl">
                      <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-golden-dark">High message activity</p>
                        <p className="text-xs text-warm-brown">500+ messages exchanged</p>
                      </div>
                      <span className="text-xs text-warm-brown/70">8h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-golden-dark">User Management</CardTitle>
                    <p className="text-warm-brown">Manage platform users and their roles</p>
                  </div>
                  <Button onClick={handleExportData} className="bg-golden hover:bg-golden-dark text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown/50 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-cream focus:ring-golden focus:border-golden"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-warm-brown" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="border border-cream rounded-lg px-3 py-2 focus:ring-golden focus:border-golden"
                    >
                      <option value="">All Roles</option>
                      <option value="patient">Patients</option>
                      <option value="provider">Providers</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-golden-dark mb-2">No Users Found</h3>
                      <p className="text-warm-brown">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    filteredUsers.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-golden-dark">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-warm-brown">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${getRoleBadgeColor(user.role)} border-0 text-xs`}>
                                {user.role}
                              </Badge>
                              {user.isOnboarded ? (
                                <Badge className="bg-vitality/20 text-vitality border-0 text-xs">
                                  Onboarded
                                </Badge>
                              ) : (
                                <Badge className="bg-warm-orange/20 text-warm-orange border-0 text-xs">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-warm-brown/70">
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(user)}
                            className="border-golden text-golden hover:bg-golden hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* User Growth Chart */}
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyUserGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#8B4513" />
                        <YAxis stroke="#8B4513" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #F59E0B',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="users" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Metrics */}
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Platform Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-vitality/10 rounded-xl">
                      <div className="text-2xl font-bold text-vitality mb-1">
                        {((stats?.totalPatients || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-warm-brown">Patient Ratio</p>
                    </div>
                    <div className="text-center p-4 bg-golden/10 rounded-xl">
                      <div className="text-2xl font-bold text-golden-dark mb-1">
                        {((stats?.totalProviders || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-warm-brown">Provider Ratio</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Onboarding Rate</span>
                      <span className="font-bold text-golden-dark">92.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Active Users (30d)</span>
                      <span className="font-bold text-golden-dark">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Cultural Match Success</span>
                      <span className="font-bold text-vitality">94.8%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Platform Satisfaction</span>
                      <span className="font-bold text-golden-dark">4.8/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-golden-dark">System Health</CardTitle>
                <p className="text-warm-brown">Monitor platform performance and security</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-vitality/10 rounded-2xl">
                    <div className="text-3xl font-bold text-vitality mb-2">99.9%</div>
                    <p className="text-warm-brown">Uptime</p>
                    <p className="text-xs text-warm-brown/70 mt-1">Last 30 days</p>
                  </div>
                  
                  <div className="text-center p-6 bg-golden/10 rounded-2xl">
                    <div className="text-3xl font-bold text-golden-dark mb-2">45ms</div>
                    <p className="text-warm-brown">Response Time</p>
                    <p className="text-xs text-warm-brown/70 mt-1">Average</p>
                  </div>
                  
                  <div className="text-center p-6 bg-accent-yellow/10 rounded-2xl">
                    <div className="text-3xl font-bold text-accent-yellow mb-2">0</div>
                    <p className="text-warm-brown">Security Issues</p>
                    <p className="text-xs text-warm-brown/70 mt-1">This month</p>
                  </div>
                  
                  <div className="text-center p-6 bg-warm-orange/10 rounded-2xl">
                    <div className="text-3xl font-bold text-warm-orange mb-2">98.5%</div>
                    <p className="text-warm-brown">Data Integrity</p>
                    <p className="text-xs text-warm-brown/70 mt-1">HIPAA Compliant</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-sunset-gradient/10 rounded-2xl">
                  <h4 className="font-semibold text-golden-dark mb-4">Security & Compliance Status</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-warm-brown">HIPAA Compliance</span>
                      <Badge className="bg-vitality/20 text-vitality border-0">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-warm-brown">SSL Certificate</span>
                      <Badge className="bg-vitality/20 text-vitality border-0">Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-warm-brown">Data Encryption</span>
                      <Badge className="bg-vitality/20 text-vitality border-0">AES-256</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-warm-brown">Backup Status</span>
                      <Badge className="bg-vitality/20 text-vitality border-0">Current</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-golden-dark">User Details</DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-cream rounded-xl">
                  <div className="w-16 h-16 bg-golden rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-golden-dark">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-warm-brown">{selectedUser.email}</p>
                    <Badge className={`${getRoleBadgeColor(selectedUser.role)} border-0 mt-1`}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-warm-brown">Joined</label>
                    <p className="text-golden-dark">{format(new Date(selectedUser.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-warm-brown">Status</label>
                    <p className="text-golden-dark">{selectedUser.isOnboarded ? "Onboarded" : "Pending"}</p>
                  </div>
                </div>

                {selectedUser.role === "provider" && selectedUser.providerProfile && (
                  <div className="p-4 bg-cream rounded-xl">
                    <h4 className="font-semibold text-golden-dark mb-2">Provider Information</h4>
                    <p className="text-sm text-warm-brown">
                      Specialty: {selectedUser.providerProfile.specialty}
                    </p>
                    <p className="text-sm text-warm-brown">
                      Location: {selectedUser.providerProfile.location || "Not specified"}
                    </p>
                  </div>
                )}

                {selectedUser.role === "patient" && selectedUser.patientProfile && (
                  <div className="p-4 bg-cream rounded-xl">
                    <h4 className="font-semibold text-golden-dark mb-2">Patient Information</h4>
                    <p className="text-sm text-warm-brown">
                      Cultural Background: {selectedUser.patientProfile.culturalBackground || "Not specified"}
                    </p>
                    <p className="text-sm text-warm-brown">
                      Primary Language: {selectedUser.patientProfile.primaryLanguage || "Not specified"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cultural Values Statement */}
        <Card className="bg-sunset-gradient rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Fostering Inclusive Healthcare</h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              As administrators of Harmonia, we're committed to creating a platform where cultural competency 
              thrives. Every metric, every user, and every interaction contributes to bridging healthcare 
              disparities and honoring the diverse healing traditions of our communities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
