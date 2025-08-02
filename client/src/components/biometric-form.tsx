import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Droplet, TrendingUp, Moon, Activity } from "lucide-react";
import { insertHealthJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

const biometricFormSchema = insertHealthJournalEntrySchema.extend({
  entryDate: z.string(),
}).omit({
  patientId: true,
});

type BiometricFormData = z.infer<typeof biometricFormSchema>;

const moodOptions = [
  { value: "excellent", emoji: "🤩", label: "Excellent" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "poor", emoji: "😢", label: "Poor" },
  { value: "terrible", emoji: "😰", label: "Terrible" },
];

const sleepQualityOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export default function BiometricForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<BiometricFormData>({
    resolver: zodResolver(biometricFormSchema),
    defaultValues: {
      entryDate: new Date().toISOString().split('T')[0],
      weightUnit: "lbs",
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: BiometricFormData) => {
      const entryData = {
        ...data,
        entryDate: new Date(data.entryDate + "T12:00:00Z"),
        mood: selectedMood,
      };
      await apiRequest("POST", "/api/health-journal", entryData);
    },
    onSuccess: () => {
      toast({
        title: "Entry Saved!",
        description: "Your health journal entry has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health-journal"] });
      reset();
      setSelectedMood("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your health journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BiometricFormData) => {
    createEntryMutation.mutate(data);
  };

  return (
    <Card className="bg-white rounded-3xl shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-golden-dark">Today's Health Entry</CardTitle>
            <p className="text-warm-brown">Track your wellness journey</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-golden">{watch("entryDate") ? new Date(watch("entryDate")).getDate() : new Date().getDate()}</div>
            <div className="text-sm text-warm-brown">Day Entry</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Date */}
          <div>
            <Label htmlFor="entryDate" className="text-warm-brown font-medium mb-2 block">Entry Date</Label>
            <Input
              id="entryDate"
              type="date"
              {...register("entryDate")}
              className="border-cream focus:ring-golden focus:border-golden"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Vitals Section */}
            <div>
              <h4 className="text-xl font-bold text-golden-dark mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-warm-orange" />
                Vital Signs
              </h4>
              <div className="space-y-4">
                {/* Blood Pressure */}
                <div className="bg-cream rounded-2xl p-4">
                  <Label className="flex items-center justify-between mb-3">
                    <span className="font-medium text-warm-brown">Blood Pressure</span>
                    <Heart className="text-warm-orange w-5 h-5" />
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      type="number"
                      placeholder="120"
                      {...register("bloodPressureSystolic", { valueAsNumber: true })}
                      className="flex-1 border-warm-orange/20 focus:ring-golden focus:border-golden"
                    />
                    <span className="self-center text-warm-brown font-bold">/</span>
                    <Input
                      type="number"
                      placeholder="80"
                      {...register("bloodPressureDiastolic", { valueAsNumber: true })}
                      className="flex-1 border-warm-orange/20 focus:ring-golden focus:border-golden"
                    />
                  </div>
                </div>

                {/* Blood Glucose */}
                <div className="bg-cream rounded-2xl p-4">
                  <Label className="flex items-center justify-between mb-3">
                    <span className="font-medium text-warm-brown">Blood Glucose</span>
                    <Droplet className="text-warm-orange w-5 h-5" />
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      type="number"
                      placeholder="95"
                      {...register("bloodGlucose", { valueAsNumber: true })}
                      className="flex-1 border-warm-orange/20 focus:ring-golden focus:border-golden"
                    />
                    <span className="self-center text-warm-brown text-sm">mg/dL</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="bg-cream rounded-2xl p-4">
                  <Label className="flex items-center justify-between mb-3">
                    <span className="font-medium text-warm-brown">Weight</span>
                    <TrendingUp className="text-warm-orange w-5 h-5" />
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="165"
                      {...register("weight", { valueAsNumber: true })}
                      className="flex-1 border-warm-orange/20 focus:ring-golden focus:border-golden"
                    />
                    <Select onValueChange={(value) => setValue("weightUnit", value)}>
                      <SelectTrigger className="w-20 border-warm-orange/20 focus:ring-golden focus:border-golden">
                        <SelectValue placeholder="lbs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Wellness Section */}
            <div>
              <h4 className="text-xl font-bold text-golden-dark mb-6">Wellness Check</h4>
              <div className="space-y-4">
                {/* Mood Tracker */}
                <div className="bg-cream rounded-2xl p-4">
                  <Label className="block font-medium text-warm-brown mb-3">How are you feeling today?</Label>
                  <div className="flex justify-between">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setSelectedMood(mood.value)}
                        className={`w-12 h-12 rounded-full transition-all text-2xl ${
                          selectedMood === mood.value
                            ? "bg-golden text-white scale-110 shadow-lg"
                            : "bg-white hover:bg-golden hover:text-white hover:scale-105"
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep */}
                <div className="bg-cream rounded-2xl p-4">
                  <Label className="flex items-center justify-between mb-3">
                    <span className="font-medium text-warm-brown">Sleep</span>
                    <Moon className="text-warm-orange w-5 h-5" />
                  </Label>
                  <div className="flex space-x-2 mb-3">
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="8"
                      {...register("sleepHours", { valueAsNumber: true })}
                      className="w-20 border-warm-orange/20 focus:ring-golden focus:border-golden"
                    />
                    <span className="self-center text-warm-brown text-sm">hours</span>
                  </div>
                  <Select onValueChange={(value) => setValue("sleepQuality", value)}>
                    <SelectTrigger className="border-warm-orange/20 focus:ring-golden focus:border-golden">
                      <SelectValue placeholder="Sleep quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {sleepQualityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Exercise */}
                <div className="bg-cream rounded-2xl p-4">
                  <Label className="flex items-center justify-between mb-3">
                    <span className="font-medium text-warm-brown">Physical Activity</span>
                    <Activity className="text-warm-orange w-5 h-5" />
                  </Label>
                  <Input
                    placeholder="Morning walk, 30 minutes"
                    {...register("physicalActivity")}
                    className="border-warm-orange/20 focus:ring-golden focus:border-golden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <Label htmlFor="notes" className="text-xl font-bold text-golden-dark mb-4 block">Today's Notes</Label>
            <Textarea
              id="notes"
              placeholder="How are you feeling? Any symptoms, concerns, or positive moments to share with your provider?"
              {...register("notes")}
              className="h-32 border-cream focus:ring-golden focus:border-golden resize-none"
            />
          </div>

          {/* Cultural Wellness */}
          <div className="bg-sunset-gradient/10 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-golden-dark mb-4">Cultural Wellness</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="traditionalPractices" className="block font-medium text-warm-brown mb-2">Traditional Practices</Label>
                <Input
                  id="traditionalPractices"
                  placeholder="Meditation, herbal tea, prayer, etc."
                  {...register("traditionalPractices")}
                  className="border-warm-orange/20 focus:ring-golden focus:border-golden"
                />
              </div>
              <div>
                <Label htmlFor="communityConnection" className="block font-medium text-warm-brown mb-2">Community Connection</Label>
                <Input
                  id="communityConnection"
                  placeholder="Family time, community events, etc."
                  {...register("communityConnection")}
                  className="border-warm-orange/20 focus:ring-golden focus:border-golden"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createEntryMutation.isPending}
              className="bg-golden hover:bg-golden-dark text-white px-8 py-3 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {createEntryMutation.isPending ? "Saving..." : "Save Today's Entry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
