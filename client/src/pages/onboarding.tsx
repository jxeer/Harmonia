import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Users, Stethoscope, ArrowRight, ArrowLeft } from "lucide-react";
import { insertPatientProfileSchema, insertProviderProfileSchema } from "@shared/schema";
import { z } from "zod";
import harmoniaLogo from "@assets/harmonia_1754109534113.jpg";

type Step = 1 | 2 | 3;

const patientFormSchema = insertPatientProfileSchema.extend({
  culturalBackground: z.string().min(1, "Cultural background is required"),
  primaryLanguage: z.string().min(1, "Primary language is required"),
});

const providerFormSchema = insertProviderProfileSchema.extend({
  specialty: z.string().min(1, "Specialty is required"),
  culturalBackgrounds: z.array(z.string()).min(1, "At least one cultural background is required"),
  languagesSpoken: z.array(z.string()).min(1, "At least one language is required"),
});

type PatientFormData = z.infer<typeof patientFormSchema>;
type ProviderFormData = z.infer<typeof providerFormSchema>;

const culturalBackgrounds = [
  "African American", "Arab/Middle Eastern", "Asian American", "Caribbean", 
  "East African", "Hispanic/Latino", "Indigenous/Native American", "Jewish",
  "Mediterranean", "Nigerian", "South Asian", "West African", "Other"
];

const languages = [
  "Arabic", "Chinese (Mandarin)", "Chinese (Cantonese)", "English", "French",
  "German", "Hindi", "Italian", "Japanese", "Korean", "Portuguese", 
  "Russian", "Spanish", "Tagalog", "Vietnamese", "Yoruba", "Other"
];

const specialties = [
  "Primary Care", "Cardiology", "Dermatology", "Endocrinology", 
  "Family Medicine", "Internal Medicine", "Mental Health", "Neurology",
  "OB/GYN", "Pediatrics", "Psychiatry", "Psychology", "Other"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [userRole, setUserRole] = useState<"patient" | "provider" | null>(null);

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      secondaryLanguages: [],
      medicalConditions: [],
      medications: [],
      allergies: [],
    },
  });

  const providerForm = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      culturalBackgrounds: [],
      languagesSpoken: [],
      certifications: [],
      telehealth: false,
      inPerson: false,
      acceptsInsurance: false,
    },
  });

  const createPatientProfileMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      await apiRequest("POST", "/api/patient/onboarding", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Harmonia!",
        description: "Your patient profile has been created successfully.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createProviderProfileMutation = useMutation({
    mutationFn: async (data: ProviderFormData) => {
      await apiRequest("POST", "/api/provider/onboarding", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Harmonia!",
        description: "Your provider profile has been created successfully.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelection = (role: "patient" | "provider") => {
    setUserRole(role);
    setStep(2);
  };

  const handlePatientSubmit = (data: PatientFormData) => {
    createPatientProfileMutation.mutate(data);
  };

  const handleProviderSubmit = (data: ProviderFormData) => {
    createProviderProfileMutation.mutate(data);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-8">
            <div>
              <img src={harmoniaLogo} alt="Harmonia Logo" className="h-20 w-20 rounded-full mx-auto mb-6 object-cover" />
              <h1 className="text-4xl font-bold text-golden-dark mb-4">
                Welcome to Harmonia
              </h1>
              <p className="text-xl text-warm-brown max-w-2xl mx-auto">
                Join our community of culturally competent healthcare. 
                Choose how you'd like to participate in our healing circle.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card 
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer border-0"
                onClick={() => handleRoleSelection("patient")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-vitality rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-golden-dark mb-4">I'm a Patient</h3>
                  <p className="text-warm-brown mb-6">
                    I'm seeking culturally competent healthcare providers who understand 
                    my background and can provide personalized care.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Find Providers</span>
                    <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Health Journal</span>
                    <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Secure Messaging</span>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer border-0"
                onClick={() => handleRoleSelection("provider")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-golden rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Stethoscope className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-golden-dark mb-4">I'm a Provider</h3>
                  <p className="text-warm-brown mb-6">
                    I'm a healthcare professional committed to providing culturally 
                    competent care and want to connect with diverse communities.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Patient Management</span>
                    <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Analytics</span>
                    <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Telehealth</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        if (userRole === "patient") {
          return (
            <Card className="bg-white rounded-3xl shadow-2xl border-0 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-golden-dark text-center">
                  Tell Us About Yourself
                </CardTitle>
                <p className="text-warm-brown text-center">
                  Help us connect you with providers who understand your cultural background and health needs.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-warm-brown font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...patientForm.register("dateOfBirth")}
                        className="border-cream focus:ring-golden focus:border-golden"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-warm-brown font-medium">Gender</Label>
                      <Select onValueChange={(value) => patientForm.setValue("gender", value)}>
                        <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="culturalBackground" className="text-warm-brown font-medium">Cultural Background *</Label>
                    <Select onValueChange={(value) => patientForm.setValue("culturalBackground", value)}>
                      <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                        <SelectValue placeholder="Select your cultural background" />
                      </SelectTrigger>
                      <SelectContent>
                        {culturalBackgrounds.map((background) => (
                          <SelectItem key={background} value={background}>
                            {background}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {patientForm.formState.errors.culturalBackground && (
                      <p className="text-destructive text-sm mt-1">
                        {patientForm.formState.errors.culturalBackground.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="primaryLanguage" className="text-warm-brown font-medium">Primary Language *</Label>
                    <Select onValueChange={(value) => patientForm.setValue("primaryLanguage", value)}>
                      <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                        <SelectValue placeholder="Select your primary language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {patientForm.formState.errors.primaryLanguage && (
                      <p className="text-destructive text-sm mt-1">
                        {patientForm.formState.errors.primaryLanguage.message}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName" className="text-warm-brown font-medium">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        {...patientForm.register("emergencyContactName")}
                        className="border-cream focus:ring-golden focus:border-golden"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone" className="text-warm-brown font-medium">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        {...patientForm.register("emergencyContactPhone")}
                        className="border-cream focus:ring-golden focus:border-golden"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="culturalPractices" className="text-warm-brown font-medium">Cultural Practices & Preferences</Label>
                    <Textarea
                      id="culturalPractices"
                      placeholder="Tell us about any cultural practices, dietary restrictions, or preferences that are important to your healthcare..."
                      {...patientForm.register("culturalPractices")}
                      className="border-cream focus:ring-golden focus:border-golden"
                    />
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-cream text-warm-brown hover:bg-cream"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={createPatientProfileMutation.isPending}
                      className="bg-golden hover:bg-golden-dark text-white px-8"
                    >
                      {createPatientProfileMutation.isPending ? "Creating Profile..." : "Complete Profile"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <Card className="bg-white rounded-3xl shadow-2xl border-0 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-golden-dark text-center">
                  Provider Profile
                </CardTitle>
                <p className="text-warm-brown text-center">
                  Help patients find you by sharing your expertise and cultural competencies.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={providerForm.handleSubmit(handleProviderSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="specialty" className="text-warm-brown font-medium">Medical Specialty *</Label>
                    <Select onValueChange={(value) => providerForm.setValue("specialty", value)}>
                      <SelectTrigger className="border-cream focus:ring-golden focus:border-golden">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {providerForm.formState.errors.specialty && (
                      <p className="text-destructive text-sm mt-1">
                        {providerForm.formState.errors.specialty.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-warm-brown font-medium">Cultural Backgrounds *</Label>
                    <p className="text-sm text-warm-brown/70 mb-3">Select all that apply to your cultural competency</p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {culturalBackgrounds.map((background) => (
                        <div key={background} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cultural-${background}`}
                            onCheckedChange={(checked) => {
                              const current = providerForm.getValues("culturalBackgrounds") || [];
                              const updated = checked
                                ? [...current, background]
                                : current.filter((b) => b !== background);
                              providerForm.setValue("culturalBackgrounds", updated);
                            }}
                          />
                          <Label htmlFor={`cultural-${background}`} className="text-sm">
                            {background}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {providerForm.formState.errors.culturalBackgrounds && (
                      <p className="text-destructive text-sm mt-1">
                        {providerForm.formState.errors.culturalBackgrounds.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-warm-brown font-medium">Languages Spoken *</Label>
                    <p className="text-sm text-warm-brown/70 mb-3">Select all languages you speak fluently</p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {languages.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={`language-${language}`}
                            onCheckedChange={(checked) => {
                              const current = providerForm.getValues("languagesSpoken") || [];
                              const updated = checked
                                ? [...current, language]
                                : current.filter((l) => l !== language);
                              providerForm.setValue("languagesSpoken", updated);
                            }}
                          />
                          <Label htmlFor={`language-${language}`} className="text-sm">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {providerForm.formState.errors.languagesSpoken && (
                      <p className="text-destructive text-sm mt-1">
                        {providerForm.formState.errors.languagesSpoken.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="culturalCompetencyStatement" className="text-warm-brown font-medium">
                      Cultural Competency Statement
                    </Label>
                    <Textarea
                      id="culturalCompetencyStatement"
                      placeholder="Describe your approach to culturally competent care and how you honor diverse backgrounds..."
                      {...providerForm.register("culturalCompetencyStatement")}
                      className="border-cream focus:ring-golden focus:border-golden"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="telehealth"
                        onCheckedChange={(checked) => providerForm.setValue("telehealth", !!checked)}
                      />
                      <Label htmlFor="telehealth" className="text-sm">Telehealth</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inPerson"
                        onCheckedChange={(checked) => providerForm.setValue("inPerson", !!checked)}
                      />
                      <Label htmlFor="inPerson" className="text-sm">In-Person</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceptsInsurance"
                        onCheckedChange={(checked) => providerForm.setValue("acceptsInsurance", !!checked)}
                      />
                      <Label htmlFor="acceptsInsurance" className="text-sm">Accepts Insurance</Label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-cream text-warm-brown hover:bg-cream"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProviderProfileMutation.isPending}
                      className="bg-golden hover:bg-golden-dark text-white px-8"
                    >
                      {createProviderProfileMutation.isPending ? "Creating Profile..." : "Complete Profile"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {renderStepContent()}
      </div>
    </div>
  );
}
