import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Users, 
  Star, 
  TrendingUp,
  Clock,
  Heart,
  Video,
  Phone,
  Award
} from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Analytics {
  totalPatients: number;
  totalAppointments: number;
  avgRating: number;
  reviewCount: number;
  monthlyAppointments: { month: string; count: number }[];
}

interface Appointment {
  id: string;
  appointmentDate: string;
  duration: number;
  type: string;
  status: string;
  isVirtual: boolean;
  patient: {
    user: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analytics } = useQuery({
    queryKey: ["/api/provider/analytics"],
    enabled: !!user && user.role === "provider",
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user && user.role === "provider",
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user && user.role === "provider",
  });

  // Filter today's appointments
  const todayAppointments = appointments.filter((apt: Appointment) => {
    const today = new Date().toDateString();
    return new Date(apt.appointmentDate).toDateString() === today;
  });

  // Get unread messages
  const unreadMessages = messages.filter((msg: Message) => 
    !msg.isRead && msg.receiverId === user?.id
  );

  // Prepare chart data
  const chartData = analytics?.monthlyAppointments?.map((item: any) => ({
    month: format(new Date(item.month + "-01"), "MMM"),
    appointments: item.count,
  })) || [];

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-accent-yellow/20 text-accent-yellow",
      confirmed: "bg-vitality/20 text-vitality",
      completed: "bg-golden/20 text-golden-dark",
      cancelled: "bg-destructive/20 text-destructive",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Provider Dashboard
          </h1>
          <p className="text-xl text-warm-brown">
            Welcome back, Dr. {user?.lastName}! Manage your practice with cultural competency at the center.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-vitality rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-vitality mb-1">{todayAppointments.length}</div>
              <div className="text-sm text-warm-brown">Today's Appointments</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golden rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-golden-dark mb-1">{analytics?.totalPatients || 0}</div>
              <div className="text-sm text-warm-brown">Active Patients</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warm-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-warm-orange mb-1">{unreadMessages.length}</div>
              <div className="text-sm text-warm-brown">New Messages</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-accent-yellow mb-1">
                {analytics?.avgRating?.toFixed(1) || "0.0"}
              </div>
              <div className="text-sm text-warm-brown">Patient Rating</div>
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
              value="appointments" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Messages ({unreadMessages.length})
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Today's Schedule */}
              <div className="lg:col-span-2">
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-golden-dark flex items-center gap-2">
                      <Calendar className="w-6 h-6" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-warm-brown/30 mx-auto mb-4" />
                        <p className="text-warm-brown">No appointments scheduled for today</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {todayAppointments.slice(0, 5).map((appointment: Appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {appointment.patient.user.firstName[0]}{appointment.patient.user.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-golden-dark">
                                  {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                                </h4>
                                <p className="text-sm text-warm-brown capitalize">{appointment.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-golden-dark">
                                {format(new Date(appointment.appointmentDate), 'h:mm a')}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getStatusColor(appointment.status)} border-0 text-xs`}>
                                  {appointment.status}
                                </Badge>
                                {appointment.isVirtual ? (
                                  <Video className="w-4 h-4 text-vitality" />
                                ) : (
                                  <Clock className="w-4 h-4 text-warm-orange" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-golden-dark">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-vitality hover:bg-vitality-light text-white justify-start">
                      <Video className="w-4 h-4 mr-2" />
                      Start Video Call
                    </Button>
                    <Button variant="outline" className="w-full border-golden text-golden hover:bg-golden hover:text-white justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Messages
                    </Button>
                    <Button variant="outline" className="w-full border-cream text-warm-brown hover:bg-cream justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Schedule
                    </Button>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-golden-dark">This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-warm-brown">Total Appointments</span>
                      <span className="font-bold text-golden-dark">{analytics?.totalAppointments || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-brown">Patient Reviews</span>
                      <span className="font-bold text-golden-dark">{analytics?.reviewCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-brown">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent-yellow fill-current" />
                        <span className="font-bold text-golden-dark">
                          {analytics?.avgRating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-golden-dark">Appointment Management</CardTitle>
                <p className="text-warm-brown">View and manage your patient appointments</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-golden-dark mb-2">No Appointments</h3>
                      <p className="text-warm-brown">Your appointments will appear here</p>
                    </div>
                  ) : (
                    appointments.slice(0, 10).map((appointment: Appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {appointment.patient.user.firstName[0]}{appointment.patient.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-golden-dark">
                              {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                            </h4>
                            <p className="text-sm text-warm-brown">
                              {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy \'at\' h:mm a')}
                            </p>
                            <p className="text-sm text-warm-brown/70 capitalize">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(appointment.status)} border-0`}>
                            {appointment.status}
                          </Badge>
                          {appointment.isVirtual ? (
                            <Button size="sm" className="bg-vitality hover:bg-vitality-light text-white">
                              <Video className="w-4 h-4 mr-1" />
                              Join
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="border-golden text-golden hover:bg-golden hover:text-white">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-golden-dark">Recent Messages</CardTitle>
                <p className="text-warm-brown">Communicate securely with your patients</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unreadMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-golden-dark mb-2">No New Messages</h3>
                      <p className="text-warm-brown">All caught up with patient communications</p>
                    </div>
                  ) : (
                    unreadMessages.slice(0, 10).map((message: Message) => (
                      <div key={message.id} className="flex items-start space-x-4 p-4 bg-cream rounded-xl">
                        <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {message.sender.firstName[0]}{message.sender.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-golden-dark">
                              {message.sender.firstName} {message.sender.lastName}
                            </h4>
                            <span className="text-sm text-warm-brown/70">
                              {format(new Date(message.createdAt), 'MMM dd, h:mm a')}
                            </span>
                          </div>
                          <p className="text-warm-brown">{message.content}</p>
                          <Button size="sm" className="mt-3 bg-golden hover:bg-golden-dark text-white">
                            Reply
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
              {/* Appointment Trends */}
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Appointment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
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
                        <Line 
                          type="monotone" 
                          dataKey="appointments" 
                          stroke="#F59E0B" 
                          strokeWidth={3}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-sunset-gradient/10 rounded-2xl">
                    <div className="text-4xl font-bold text-golden-dark mb-2">
                      {analytics?.avgRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            i < Math.round(analytics?.avgRating || 0) 
                              ? "text-accent-yellow fill-current" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-warm-brown">Average Patient Rating</p>
                    <p className="text-sm text-warm-brown/70">
                      Based on {analytics?.reviewCount || 0} reviews
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Total Patients</span>
                      <span className="font-bold text-golden-dark text-xl">
                        {analytics?.totalPatients || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Total Appointments</span>
                      <span className="font-bold text-golden-dark text-xl">
                        {analytics?.totalAppointments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-cream rounded-xl">
                      <span className="text-warm-brown">Cultural Competency Focus</span>
                      <Badge className="bg-vitality/20 text-vitality border-0">
                        Excellent
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Cultural Competency Insight */}
        <Card className="bg-sunset-gradient rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Your Cultural Impact</h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              You're making a difference by providing culturally competent care. Your understanding of diverse 
              backgrounds and healing traditions creates a safe space where patients feel truly seen and heard. 
              Keep fostering trust through cultural sensitivity and holistic healing approaches.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
