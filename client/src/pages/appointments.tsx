import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import AppointmentCard from "@/components/appointment-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Plus, Video, Phone, MapPin, Filter } from "lucide-react";
import { format, addDays, startOfToday, isSameDay, isAfter, isBefore } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { Link } from "wouter";

const appointmentFormSchema = insertAppointmentSchema.omit({
  patientId: true,
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface Appointment {
  id: string;
  appointmentDate: string;
  duration: number;
  type: string;
  status: string;
  isVirtual: boolean;
  meetingLink?: string;
  notes?: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  };
  provider?: {
    user: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    specialty: string;
    location: string;
  };
}

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      duration: 30,
      type: "consultation",
      isVirtual: false,
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) => {
      if (data.appointmentDate) {
        data.appointmentDate = new Date(data.appointmentDate);
      }
      await apiRequest("PUT", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Updated",
        description: "Your appointment has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setRescheduleDialogOpen(false);
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const today = startOfToday();
  
  const upcomingAppointments = appointments.filter((apt: Appointment) => 
    isAfter(new Date(apt.appointmentDate), today) || isSameDay(new Date(apt.appointmentDate), today)
  );
  
  const pastAppointments = appointments.filter((apt: Appointment) => 
    isBefore(new Date(apt.appointmentDate), today)
  );

  const todayAppointments = appointments.filter((apt: Appointment) => 
    isSameDay(new Date(apt.appointmentDate), today)
  );

  const getFilteredAppointments = (appointmentList: Appointment[]) => {
    return appointmentList.filter((apt) => {
      const matchesStatus = filterStatus === "" || apt.status === filterStatus;
      const matchesType = filterType === "" || apt.type === filterType;
      return matchesStatus && matchesType;
    });
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setValue("appointmentDate", format(new Date(appointment.appointmentDate), "yyyy-MM-dd'T'HH:mm"));
    setValue("duration", appointment.duration);
    setValue("type", appointment.type);
    setValue("isVirtual", appointment.isVirtual);
    setValue("notes", appointment.notes || "");
    setRescheduleDialogOpen(true);
  };

  const handleCancel = (appointment: Appointment) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      data: { status: "cancelled" }
    });
  };

  const handleJoinMeeting = (appointment: Appointment) => {
    if (appointment.meetingLink) {
      window.open(appointment.meetingLink, '_blank');
    } else {
      toast({
        title: "Meeting Link Unavailable",
        description: "The meeting link will be provided by your provider.",
        variant: "destructive",
      });
    }
  };

  const onRescheduleSubmit = (data: AppointmentFormData) => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        id: selectedAppointment.id,
        data
      });
    }
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const upcoming = upcomingAppointments.length;
    const completed = appointments.filter((apt: Appointment) => apt.status === "completed").length;
    const cancelled = appointments.filter((apt: Appointment) => apt.status === "cancelled").length;
    
    return { total, upcoming, completed, cancelled };
  };

  const stats = getAppointmentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Appointments
            </h1>
            <p className="text-xl text-warm-brown">
              Manage your healthcare appointments with culturally competent providers.
            </p>
          </div>
          
          <Link href="/providers">
            <Button className="bg-golden hover:bg-golden-dark text-white mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golden rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-golden-dark mb-1">{stats.total}</div>
              <div className="text-sm text-warm-brown">Total Appointments</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-vitality rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-vitality mb-1">{stats.upcoming}</div>
              <div className="text-sm text-warm-brown">Upcoming</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-3">
                <Video className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-accent-yellow mb-1">{stats.completed}</div>
              <div className="text-sm text-warm-brown">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warm-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-warm-orange mb-1">{todayAppointments.length}</div>
              <div className="text-sm text-warm-brown">Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white rounded-3xl shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Filter className="w-5 h-5 text-warm-brown md:mr-2" />
              <div className="flex flex-col md:flex-row gap-4 flex-grow">
                <Select onValueChange={setFilterStatus} value={filterStatus}>
                  <SelectTrigger className="w-full md:w-48 border-cream focus:ring-golden focus:border-golden">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={setFilterType} value={filterType}>
                  <SelectTrigger className="w-full md:w-48 border-cream focus:ring-golden focus:border-golden">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="check-up">Check-up</SelectItem>
                    <SelectItem value="wellness">Wellness Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(filterStatus || filterType) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterStatus("");
                    setFilterType("");
                  }}
                  className="border-cream text-warm-brown hover:bg-cream"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl p-1">
            <TabsTrigger 
              value="today" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Today ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div className="space-y-6">
              {isLoading ? (
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto mb-4"></div>
                      <p className="text-warm-brown">Loading appointments...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : getFilteredAppointments(todayAppointments).length === 0 ? (
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardContent className="text-center py-20">
                    <Calendar className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-golden-dark mb-4">No Appointments Today</h3>
                    <p className="text-warm-brown mb-6 max-w-md mx-auto">
                      You have no appointments scheduled for today. Take this time to focus on your wellness routine.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getFilteredAppointments(todayAppointments).map((appointment: Appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole={user?.role as "patient" | "provider" | "admin"}
                    onJoinMeeting={() => handleJoinMeeting(appointment)}
                    onReschedule={() => handleReschedule(appointment)}
                    onCancel={() => handleCancel(appointment)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="space-y-6">
              {isLoading ? (
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto mb-4"></div>
                      <p className="text-warm-brown">Loading appointments...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : getFilteredAppointments(upcomingAppointments).length === 0 ? (
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardContent className="text-center py-20">
                    <Calendar className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-golden-dark mb-4">No Upcoming Appointments</h3>
                    <p className="text-warm-brown mb-6 max-w-md mx-auto">
                      You don't have any upcoming appointments. Book a visit with one of our culturally competent providers.
                    </p>
                    <Link href="/providers">
                      <Button className="bg-golden hover:bg-golden-dark text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                getFilteredAppointments(upcomingAppointments).map((appointment: Appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole={user?.role as "patient" | "provider" | "admin"}
                    onJoinMeeting={() => handleJoinMeeting(appointment)}
                    onReschedule={() => handleReschedule(appointment)}
                    onCancel={() => handleCancel(appointment)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-6">
              {isLoading ? (
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto mb-4"></div>
                      <p className="text-warm-brown">Loading appointments...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : getFilteredAppointments(pastAppointments).length === 0 ? (
                <Card className="bg-white rounded-3xl shadow-lg border-0">
                  <CardContent className="text-center py-20">
                    <Calendar className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-golden-dark mb-4">No Past Appointments</h3>
                    <p className="text-warm-brown">Your appointment history will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                getFilteredAppointments(pastAppointments).map((appointment: Appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userRole={user?.role as "patient" | "provider" | "admin"}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-golden-dark">Reschedule Appointment</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onRescheduleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="appointmentDate" className="text-warm-brown font-medium">
                  New Date & Time
                </Label>
                <Input
                  id="appointmentDate"
                  type="datetime-local"
                  {...register("appointmentDate")}
                  className="border-cream focus:ring-golden focus:border-golden"
                />
                {errors.appointmentDate && (
                  <p className="text-destructive text-sm mt-1">{errors.appointmentDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes" className="text-warm-brown font-medium">Reason for Rescheduling</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional: Let your provider know why you're rescheduling..."
                  {...register("notes")}
                  className="border-cream focus:ring-golden focus:border-golden"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleDialogOpen(false)}
                  className="border-cream text-warm-brown hover:bg-cream"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateAppointmentMutation.isPending}
                  className="bg-golden hover:bg-golden-dark text-white"
                >
                  {updateAppointmentMutation.isPending ? "Rescheduling..." : "Reschedule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cultural Wellness Tip */}
        <Card className="bg-sunset-gradient rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Preparing for Your Appointment</h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Come prepared to share not just your symptoms, but your whole story. Your cultural practices, 
              family history, and personal wellness traditions are all valuable parts of your health journey 
              that help your provider give you the best care.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
