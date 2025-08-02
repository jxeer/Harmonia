import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Providers from "@/pages/providers";
import HealthJournal from "@/pages/health-journal";
import MedicalRecords from "@/pages/medical-records";
import Appointments from "@/pages/appointments";
import Messages from "@/pages/messages";
import ProviderDashboard from "@/pages/provider-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto"></div>
          <p className="text-golden-dark font-medium mt-4">Loading Harmonia...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
        </>
      ) : (
        <>
          {!user?.isOnboarded && <Route path="/onboarding" component={Onboarding} />}
          <Route path="/" component={Home} />
          <Route path="/providers" component={Providers} />
          <Route path="/health-journal" component={HealthJournal} />
          <Route path="/medical-records" component={MedicalRecords} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/messages" component={Messages} />
          {user?.role === "provider" && (
            <Route path="/provider-dashboard" component={ProviderDashboard} />
          )}
          {user?.role === "admin" && (
            <Route path="/admin" component={AdminDashboard} />
          )}
          <Route path="/onboarding" component={Onboarding} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
