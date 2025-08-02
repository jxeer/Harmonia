import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Video, Phone, MessageSquare } from "lucide-react";
import { Link } from "wouter";

interface ProviderCardProps {
  provider: {
    id: string;
    userId: string;
    specialty: string;
    culturalBackgrounds: string[];
    languagesSpoken: string[];
    bio: string;
    culturalCompetencyStatement: string;
    telehealth: boolean;
    inPerson: boolean;
    location: string;
    rating: string;
    reviewCount: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  };
  onBookAppointment?: () => void;
  onSendMessage?: () => void;
}

export default function ProviderCard({ provider, onBookAppointment, onSendMessage }: ProviderCardProps) {
  const rating = parseFloat(provider.rating || "0");
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {provider.user.profileImageUrl ? (
              <img 
                src={provider.user.profileImageUrl} 
                alt={`Dr. ${provider.user.firstName} ${provider.user.lastName}`}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-sunset-gradient flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {provider.user.firstName[0]}{provider.user.lastName[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-golden-dark">
                  Dr. {provider.user.firstName} {provider.user.lastName}
                </h3>
                <p className="text-warm-brown">{provider.specialty}</p>
                <p className="text-sm text-warm-brown/70">{provider.location}</p>
              </div>
              <div className="flex items-center space-x-1 mt-2 md:mt-0">
                <div className="flex text-accent-yellow">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < fullStars 
                          ? "fill-current" 
                          : i === fullStars && hasHalfStar
                          ? "fill-current opacity-50"
                          : "text-gray-300"
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-warm-brown ml-2">
                  {rating.toFixed(1)} ({provider.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {provider.culturalBackgrounds?.map((background) => (
                <span 
                  key={background}
                  className="bg-vitality/10 text-vitality px-3 py-1 rounded-full text-sm"
                >
                  {background}
                </span>
              ))}
              {provider.languagesSpoken?.map((language) => (
                <span 
                  key={language}
                  className="bg-golden/10 text-golden-dark px-3 py-1 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
              {provider.telehealth && (
                <span className="bg-warm-orange/10 text-warm-orange px-3 py-1 rounded-full text-sm">
                  Telehealth
                </span>
              )}
              {provider.inPerson && (
                <span className="bg-accent-yellow/10 text-accent-yellow px-3 py-1 rounded-full text-sm">
                  In-Person
                </span>
              )}
            </div>

            <p className="text-warm-brown mb-4 line-clamp-3">
              {provider.culturalCompetencyStatement || provider.bio}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={onBookAppointment}
                className="bg-golden hover:bg-golden-dark text-white px-6 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Button>
              <Button 
                variant="outline"
                className="border border-golden text-golden hover:bg-golden hover:text-white px-6 py-2 rounded-xl transition-all"
              >
                <Link href={`/providers/${provider.id}`} className="flex items-center gap-2">
                  View Profile
                </Link>
              </Button>
              <Button 
                variant="outline"
                onClick={onSendMessage}
                className="border border-cream text-warm-brown hover:bg-cream px-6 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
