import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Phone, MapPin, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface AppointmentCardProps {
  appointment: {
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
  };
  userRole: "patient" | "provider" | "admin";
  onJoinMeeting?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onMessage?: () => void;
}

export default function AppointmentCard({ 
  appointment, 
  userRole, 
  onJoinMeeting, 
  onReschedule, 
  onCancel, 
  onMessage 
}: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isUpcoming = appointmentDate > new Date();
  const isToday = format(appointmentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  const otherParty = userRole === "patient" ? appointment.provider : appointment.patient;
  const otherPartyName = otherParty?.user ? `${otherParty.user.firstName} ${otherParty.user.lastName}` : "Unknown";

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-accent-yellow/20 text-accent-yellow",
      confirmed: "bg-vitality/20 text-vitality",
      completed: "bg-golden/20 text-golden-dark",
      cancelled: "bg-destructive/20 text-destructive",
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants] || variants.scheduled} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {otherParty?.user?.profileImageUrl ? (
              <img 
                src={otherParty.user.profileImageUrl} 
                alt={otherPartyName}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-golden-gradient flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {otherPartyName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-golden-dark mb-1">
                  {userRole === "patient" ? `Dr. ${otherPartyName}` : otherPartyName}
                </h3>
                {userRole === "patient" && appointment.provider && (
                  <p className="text-warm-brown">{appointment.provider.specialty}</p>
                )}
                <p className="text-sm text-warm-brown/70 capitalize">{appointment.type} appointment</p>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                {getStatusBadge(appointment.status)}
                {isToday && (
                  <Badge className="bg-warm-orange/20 text-warm-orange border-0">
                    Today
                  </Badge>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-warm-brown">
                <Calendar className="w-4 h-4" />
                <span>{format(appointmentDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2 text-warm-brown">
                <Clock className="w-4 h-4" />
                <span>{format(appointmentDate, 'h:mm a')} ({appointment.duration} min)</span>
              </div>
              <div className="flex items-center space-x-2 text-warm-brown">
                {appointment.isVirtual ? (
                  <>
                    <Video className="w-4 h-4" />
                    <span>Virtual appointment</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.provider?.location || "In-person"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="bg-cream rounded-xl p-3 mb-4">
                <p className="text-warm-brown text-sm">{appointment.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {isUpcoming && appointment.status === "confirmed" && appointment.isVirtual && appointment.meetingLink && (
                <Button 
                  onClick={onJoinMeeting}
                  className="bg-vitality hover:bg-vitality-light text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Join Meeting
                </Button>
              )}
              
              {isUpcoming && onMessage && (
                <Button 
                  variant="outline"
                  onClick={onMessage}
                  className="border-golden text-golden hover:bg-golden hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              )}

              {isUpcoming && appointment.status !== "cancelled" && onReschedule && (
                <Button 
                  variant="outline"
                  onClick={onReschedule}
                  className="border-cream text-warm-brown hover:bg-cream px-4 py-2 rounded-xl transition-all"
                >
                  Reschedule
                </Button>
              )}

              {isUpcoming && appointment.status !== "cancelled" && onCancel && (
                <Button 
                  variant="outline"
                  onClick={onCancel}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white px-4 py-2 rounded-xl transition-all"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
