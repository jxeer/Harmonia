import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { Heart, Calendar, MessageSquare, FileText, Users, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: recentMessages } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  const { data: upcomingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  if (!user?.isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="bg-white rounded-3xl shadow-2xl border-0 text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-sunset-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-white w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold text-golden-dark mb-4">
                Welcome to Harmonia!
              </h1>
              <p className="text-xl text-warm-brown mb-8 max-w-2xl mx-auto">
                Let's complete your profile to connect you with culturally competent healthcare providers 
                who understand your unique needs.
              </p>
              <Link href="/onboarding">
                <Button 
                  size="lg"
                  className="bg-golden hover:bg-golden-dark text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105"
                >
                  Complete Your Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-golden-dark mb-2">
            Welcome back, {user?.firstName || "friend"}!
          </h1>
          <p className="text-xl text-warm-brown">
            Your health journey continues with culturally affirming care.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/health-journal">
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-vitality rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-golden-dark mb-2">Health Journal</h3>
                <p className="text-sm text-warm-brown">Track your daily wellness</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/appointments">
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-golden rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-golden-dark mb-2">Appointments</h3>
                <p className="text-sm text-warm-brown">Book or manage visits</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/messages">
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-warm-orange rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-golden-dark mb-2">Messages</h3>
                <p className="text-sm text-warm-brown">Chat with providers</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/providers">
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-0">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-golden-dark mb-2">Find Providers</h3>
                <p className="text-sm text-warm-brown">Discover cultural matches</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-golden-dark flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments?.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-cream rounded-xl">
                      <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center">
                        <Calendar className="text-white w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-golden-dark">
                          Appointment with Dr. {appointment.provider?.user?.lastName}
                        </h4>
                        <p className="text-sm text-warm-brown">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at{" "}
                          {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-vitality/20 text-vitality' 
                          : 'bg-accent-yellow/20 text-accent-yellow'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-warm-brown/30 mx-auto mb-4" />
                      <p className="text-warm-brown">No recent appointments</p>
                      <Link href="/appointments">
                        <Button className="mt-4 bg-golden hover:bg-golden-dark text-white">
                          Book Your First Appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats & Messages */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {user?.role === "patient" && (
              <Card className="bg-white rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-golden-dark">Your Health Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-warm-brown">Journal Entries</span>
                      <span className="text-golden-dark font-semibold">12 this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-brown">Appointments</span>
                      <span className="text-golden-dark font-semibold">3 completed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-brown">Streak</span>
                      <span className="text-vitality font-semibold">7 days 🔥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Messages */}
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-golden-dark flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages?.slice(0, 3).map((message: any) => (
                    <div key={message.id} className="flex items-start space-x-3 p-3 bg-cream rounded-xl">
                      <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {message.sender?.firstName?.[0] || "?"}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-golden-dark text-sm">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </p>
                        <p className="text-warm-brown text-xs truncate">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <MessageSquare className="w-8 h-8 text-warm-brown/30 mx-auto mb-2" />
                      <p className="text-warm-brown text-sm">No messages yet</p>
                    </div>
                  )}
                </div>
                {recentMessages?.length > 0 && (
                  <Link href="/messages">
                    <Button variant="outline" className="w-full mt-4 border-golden text-golden hover:bg-golden hover:text-white">
                      View All Messages
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cultural Wellness Tip */}
        <Card className="bg-sunset-gradient rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Today's Wellness Wisdom</h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              "Healing is not just about treating illness, but nurturing the whole person - 
              mind, body, spirit, and cultural identity. Honor your heritage as part of your wellness journey."
            </p>
            <div className="mt-6">
              <span className="text-white/80 text-sm">— Inspired by Ọṣun, Orisha of Healing and Beauty</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
