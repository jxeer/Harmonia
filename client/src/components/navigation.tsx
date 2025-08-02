import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  Heart, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Menu, 
  X, 
  Home,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";
import harmoniaLogo from "@assets/harmonia_1754109534113.jpg";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const patientNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/providers", icon: Users, label: "Find Providers" },
    { href: "/health-journal", icon: Heart, label: "Health Journal" },
    { href: "/appointments", icon: Calendar, label: "Appointments" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/medical-records", icon: FileText, label: "Medical Records" },
  ];

  const providerNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/provider-dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/appointments", icon: Calendar, label: "Appointments" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
  ];

  const adminNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/admin", icon: Settings, label: "Admin Panel" },
  ];

  const getNavItems = () => {
    if (user?.role === "provider") return providerNavItems;
    if (user?.role === "admin") return adminNavItems;
    return patientNavItems;
  };

  const navItems = getNavItems();

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <img src={harmoniaLogo} alt="Harmonia Logo" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-xl font-bold text-golden-dark">Harmonia</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                        isActive 
                          ? "bg-golden text-white" 
                          : "text-warm-brown hover:text-golden hover:bg-golden/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );
              })}
              
              <div className="flex items-center space-x-3 pl-3 border-l border-cream">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.firstName?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-warm-brown font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-warm-brown hover:text-golden"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? 
                <X className="text-golden-dark w-6 h-6" /> : 
                <Menu className="text-golden-dark w-6 h-6" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden">
          <div className="bg-white h-full w-80 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <img src={harmoniaLogo} alt="Harmonia Logo" className="h-8 w-8 rounded-full object-cover" />
                <span className="text-xl font-bold text-golden-dark">Harmonia</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="text-golden-dark w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive 
                          ? "bg-golden text-white" 
                          : "text-warm-brown hover:bg-golden/10"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-cream">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.firstName?.[0] || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-golden-dark">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-warm-brown capitalize">{user?.role}</p>
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full border-golden text-golden hover:bg-golden hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
