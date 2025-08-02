import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import CulturalFilters from "@/components/cultural-filters";
import ProviderCard from "@/components/provider-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Users, Calendar, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

const appointmentFormSchema = insertAppointmentSchema.omit({
  patientId: true,
});

const messageFormSchema = insertMessageSchema.omit({
  senderId: true,
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
type MessageFormData = z.infer<typeof messageFormSchema>;

export default function Providers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({});
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const { data: providers = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/providers/search", filters],
    enabled: !!user,
  });

  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      duration: 30,
      type: "consultation",
      isVirtual: false,
    },
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Requested",
        description: "Your appointment request has been sent to the provider.",
      });
      setAppointmentDialogOpen(false);
      appointmentForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to request appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the provider.",
      });
      setMessageDialogOpen(false);
      messageForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    refetch();
  };

  const handleBookAppointment = (provider: any) => {
    setSelectedProvider(provider);
    appointmentForm.setValue("providerId", provider.id);
    setAppointmentDialogOpen(true);
  };

  const handleSendMessage = (provider: any) => {
    setSelectedProvider(provider);
    messageForm.setValue("receiverId", provider.userId);
    setMessageDialogOpen(true);
  };

  const onAppointmentSubmit = (data: AppointmentFormData) => {
    createAppointmentMutation.mutate({
      ...data,
      appointmentDate: new Date(data.appointmentDate),
    });
  };

  const onMessageSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Find Your Provider
          </h1>
          <p className="text-xl text-warm-brown">
            Discover healthcare providers who understand your cultural background and speak your language.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CulturalFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
        </div>

        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto mb-4"></div>
                  <p className="text-warm-brown">Searching for providers...</p>
                </div>
              </CardContent>
            </Card>
          ) : providers.length === 0 ? (
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardContent className="text-center py-20">
                <Users className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-golden-dark mb-4">No Providers Found</h3>
                <p className="text-warm-brown mb-6 max-w-md mx-auto">
                  We couldn't find any providers matching your criteria. Try adjusting your filters or check back later.
                </p>
                <Button 
                  onClick={() => handleFiltersChange({})}
                  className="bg-golden hover:bg-golden-dark text-white"
                >
                  View All Providers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-warm-brown">
                  Found {providers.length} culturally competent provider{providers.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {providers.map((provider: any) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onBookAppointment={() => handleBookAppointment(provider)}
                  onSendMessage={() => handleSendMessage(provider)}
                />
              ))}
            </>
          )}
        </div>

        {/* Book Appointment Dialog */}
        <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-golden-dark">
                Book Appointment with Dr. {selectedProvider?.user?.firstName} {selectedProvider?.user?.lastName}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="appointmentDate" className="text-warm-brown font-medium">
                  Preferred Date & Time
                </Label>
                <Input
                  id="appointmentDate"
                  type="datetime-local"
                  {...appointmentForm.register("appointmentDate")}
                  className="border-cream focus:ring-golden focus:border-golden"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-warm-brown font-medium">Appointment Type</Label>
                <Select onValueChange={(value) => appointmentForm.setValue("type", value)}>
                  <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="check-up">Check-up</SelectItem>
                    <SelectItem value="wellness">Wellness Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration" className="text-warm-brown font-medium">Duration (minutes)</Label>
                <Select onValueChange={(value) => appointmentForm.setValue("duration", parseInt(value))}>
                  <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVirtual"
                  {...appointmentForm.register("isVirtual")}
                  className="rounded border-cream text-golden focus:ring-golden"
                />
                <Label htmlFor="isVirtual" className="text-warm-brown">Virtual appointment (telehealth)</Label>
              </div>

              <div>
                <Label htmlFor="notes" className="text-warm-brown font-medium">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific concerns or requests..."
                  {...appointmentForm.register("notes")}
                  className="border-cream focus:ring-golden focus:border-golden"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAppointmentDialogOpen(false)}
                  className="border-cream text-warm-brown hover:bg-cream"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAppointmentMutation.isPending}
                  className="bg-golden hover:bg-golden-dark text-white"
                >
                  {createAppointmentMutation.isPending ? "Requesting..." : "Request Appointment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-golden-dark">
                Message Dr. {selectedProvider?.user?.firstName} {selectedProvider?.user?.lastName}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="content" className="text-warm-brown font-medium">Message</Label>
                <Textarea
                  id="content"
                  placeholder="Ask a question or share your concerns..."
                  {...messageForm.register("content")}
                  className="border-cream focus:ring-golden focus:border-golden h-32"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMessageDialogOpen(false)}
                  className="border-cream text-warm-brown hover:bg-cream"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="bg-golden hover:bg-golden-dark text-white"
                >
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
