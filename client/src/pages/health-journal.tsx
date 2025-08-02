import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import BiometricForm from "@/components/biometric-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Calendar, Activity, Droplet, Moon } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface HealthJournalEntry {
  id: string;
  entryDate: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodGlucose?: number;
  weight?: number;
  weightUnit: string;
  mood?: string;
  sleepHours?: number;
  sleepQuality?: string;
  physicalActivity?: string;
  traditionalPractices?: string;
  communityConnection?: string;
  notes?: string;
  createdAt: string;
}

const getMoodEmoji = (mood?: string) => {
  const moodMap: Record<string, string> = {
    excellent: "🤩",
    good: "😊",
    okay: "😐",
    poor: "😢",
    terrible: "😰",
  };
  return moodMap[mood || ""] || "😊";
};

export default function HealthJournal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new-entry");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/health-journal"],
    enabled: !!user,
  });

  const getStreakCount = () => {
    if (!entries.length) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].entryDate);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyStats = () => {
    const lastWeek = entries.slice(0, 7);
    const avgBP = lastWeek.filter(e => e.bloodPressureSystolic).length > 0 
      ? Math.round(lastWeek.reduce((sum, e) => sum + (e.bloodPressureSystolic || 0), 0) / lastWeek.filter(e => e.bloodPressureSystolic).length)
      : null;
    
    const avgSleep = lastWeek.filter(e => e.sleepHours).length > 0
      ? (lastWeek.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / lastWeek.filter(e => e.sleepHours).length).toFixed(1)
      : null;

    const activeDays = lastWeek.filter(e => e.physicalActivity && e.physicalActivity.trim().length > 0).length;

    return { avgBP, avgSleep, activeDays };
  };

  const stats = getWeeklyStats();
  const streak = getStreakCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8" />
            Health Journal
          </h1>
          <p className="text-xl text-warm-brown">
            Track your wellness journey with daily entries that honor your whole self.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-vitality rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-vitality mb-1">{streak}</div>
              <div className="text-sm text-warm-brown">Day Streak 🔥</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warm-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-warm-orange mb-1">
                {stats.avgBP || "--"}
              </div>
              <div className="text-sm text-warm-brown">Avg BP (7d)</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center mx-auto mb-3">
                <Moon className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-accent-yellow mb-1">
                {stats.avgSleep || "--"}h
              </div>
              <div className="text-sm text-warm-brown">Avg Sleep (7d)</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-golden rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-golden-dark mb-1">{stats.activeDays}</div>
              <div className="text-sm text-warm-brown">Active Days (7d)</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl p-1">
            <TabsTrigger 
              value="new-entry" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              New Entry
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-xl data-[state=active]:bg-golden data-[state=active]:text-white"
            >
              Entry History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-entry">
            <BiometricForm />
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-golden-dark flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Your Health Journey
                </CardTitle>
                <p className="text-warm-brown">Review your wellness entries and track your progress</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden"></div>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-golden-dark mb-2">No entries yet</h3>
                    <p className="text-warm-brown mb-6">Start your wellness journey by creating your first entry!</p>
                    <Button 
                      onClick={() => setActiveTab("new-entry")}
                      className="bg-golden hover:bg-golden-dark text-white"
                    >
                      Create First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry: HealthJournalEntry) => (
                      <Card key={entry.id} className="bg-cream rounded-2xl border-0">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-golden-dark">
                                {format(new Date(entry.entryDate), 'EEEE, MMMM dd, yyyy')}
                              </h4>
                              <p className="text-sm text-warm-brown">
                                Logged {format(new Date(entry.createdAt), 'h:mm a')}
                              </p>
                            </div>
                            {entry.mood && (
                              <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {(entry.bloodPressureSystolic && entry.bloodPressureDiastolic) && (
                              <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-warm-orange" />
                                <span className="text-warm-brown text-sm">
                                  BP: {entry.bloodPressureSystolic}/{entry.bloodPressureDiastolic}
                                </span>
                              </div>
                            )}
                            
                            {entry.bloodGlucose && (
                              <div className="flex items-center space-x-2">
                                <Droplet className="w-4 h-4 text-warm-orange" />
                                <span className="text-warm-brown text-sm">
                                  Glucose: {entry.bloodGlucose} mg/dL
                                </span>
                              </div>
                            )}

                            {entry.weight && (
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-warm-orange" />
                                <span className="text-warm-brown text-sm">
                                  Weight: {entry.weight} {entry.weightUnit}
                                </span>
                              </div>
                            )}

                            {entry.sleepHours && (
                              <div className="flex items-center space-x-2">
                                <Moon className="w-4 h-4 text-warm-orange" />
                                <span className="text-warm-brown text-sm">
                                  Sleep: {entry.sleepHours}h ({entry.sleepQuality})
                                </span>
                              </div>
                            )}
                          </div>

                          {entry.physicalActivity && (
                            <div className="mb-3">
                              <Badge className="bg-vitality/10 text-vitality border-0 mr-2">
                                Activity
                              </Badge>
                              <span className="text-warm-brown text-sm">{entry.physicalActivity}</span>
                            </div>
                          )}

                          {entry.traditionalPractices && (
                            <div className="mb-3">
                              <Badge className="bg-golden/10 text-golden-dark border-0 mr-2">
                                Cultural Practices
                              </Badge>
                              <span className="text-warm-brown text-sm">{entry.traditionalPractices}</span>
                            </div>
                          )}

                          {entry.communityConnection && (
                            <div className="mb-3">
                              <Badge className="bg-accent-yellow/10 text-accent-yellow border-0 mr-2">
                                Community
                              </Badge>
                              <span className="text-warm-brown text-sm">{entry.communityConnection}</span>
                            </div>
                          )}

                          {entry.notes && (
                            <div className="mt-4 p-3 bg-white rounded-xl">
                              <p className="text-warm-brown text-sm">{entry.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cultural Wellness Tip */}
        <Card className="bg-sunset-gradient rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Daily Wellness Reflection</h3>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              "Like the flowing waters of Ọṣun, let your wellness journey be continuous and life-giving. 
              Each entry in your health journal is a sacred offering to your well-being."
            </p>
            <div className="mt-6">
              <span className="text-white/80 text-sm">— Honoring the wisdom of ancestral healing traditions</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
