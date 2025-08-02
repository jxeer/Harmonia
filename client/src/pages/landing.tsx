import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, MessageCircle, Star, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import harmoniaLogo from "@assets/harmonia_1754109534113.jpg";
import diverseTeam from "@assets/istockphoto-1387028955-612x612_1754109523067.jpg";
import healthcareProfessional from "@assets/istockphoto-1407611614-612x612_1754109523068.jpg";
import happyPatient from "@assets/happy-black-man-running-park-600nw-2267710607_1754109534111.webp";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <div className="bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={harmoniaLogo} alt="Harmonia Logo" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xl font-bold text-orange-600">Harmonia</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">Features</a>
              <a href="#providers" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">Find Providers</a>
              <a href="#testimonials" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">Testimonials</a>
              <Button onClick={handleSignIn} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-all transform hover:scale-105 font-semibold">
                Sign In
              </Button>
            </div>
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="text-golden-dark" /> : <Menu className="text-golden-dark" />}
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
            <nav className="space-y-4">
              <a href="#features" className="block text-lg text-warm-brown hover:text-golden transition-colors py-2">Features</a>
              <a href="#providers" className="block text-lg text-warm-brown hover:text-golden transition-colors py-2">Find Providers</a>
              <a href="#testimonials" className="block text-lg text-warm-brown hover:text-golden transition-colors py-2">Testimonials</a>
              <Button 
                onClick={handleSignIn}
                className="w-full bg-golden hover:bg-golden-dark text-white px-6 py-3 rounded-full text-lg font-semibold transition-all mt-6"
              >
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Healthcare that{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">understands you</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with culturally competent healthcare providers who honor your background, 
                understand your needs, and support your wellness journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSignIn}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Find Your Provider
                </Button>
                <Button 
                  onClick={handleSignIn}
                  variant="outline"
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
                >
                  Join as Provider
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={diverseTeam} 
                  alt="Diverse healthcare team smiling together" 
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-vitality rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-warm-brown">1,200+ Providers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-golden-dark mb-4">
              Your health journey, supported every step
            </h2>
            <p className="text-xl text-warm-brown max-w-3xl mx-auto">
              From finding the right provider to tracking your daily wellness, 
              Harmonia provides culturally competent care that honors who you are.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Provider Directory */}
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-golden rounded-2xl flex items-center justify-center mb-6">
                  <Users className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-golden-dark mb-4">Find Your Provider</h3>
                <p className="text-warm-brown mb-6">
                  Search by specialty, cultural background, and language to find providers 
                  who truly understand your needs and heritage.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Cultural Match</span>
                  <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Language</span>
                  <span className="bg-cream text-warm-brown px-3 py-1 rounded-full text-sm">Specialty</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Health Journal */}
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-vitality rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-golden-dark mb-4">Daily Health Journal</h3>
                <p className="text-warm-brown mb-6">
                  Track your vitals, mood, and wellness patterns to give your provider 
                  a complete picture of your day-to-day health.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-cream rounded-lg p-3">
                    <span className="text-warm-brown">Blood Pressure</span>
                    <span className="text-golden font-semibold">120/80</span>
                  </div>
                  <div className="flex items-center justify-between bg-cream rounded-lg p-3">
                    <span className="text-warm-brown">Mood</span>
                    <span className="text-golden font-semibold">😊 Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Secure Communication */}
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-warm-orange rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-golden-dark mb-4">Stay Connected</h3>
                <p className="text-warm-brown mb-6">
                  Secure messaging, appointment booking, and access to your medical records 
                  keep you connected with your care team.
                </p>
                <div className="bg-cream rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Dr</span>
                    </div>
                    <span className="text-warm-brown font-medium">Dr. Sarah Johnson</span>
                  </div>
                  <p className="text-sm text-warm-brown">"Your latest results look great! Keep up the good work with your wellness routine."</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Provider Showcase */}
      <section id="providers" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-sunset-gradient p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Meet Our Culturally Competent Providers</h2>
              <p className="text-white/90">Diverse backgrounds, unified commitment to your health</p>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Provider 1 */}
                <div className="border border-cream rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={healthcareProfessional} 
                        alt="Dr. Amara Okafor, Primary Care Physician" 
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-golden-dark">Dr. Amara Okafor</h3>
                          <p className="text-warm-brown">Primary Care Physician</p>
                          <p className="text-sm text-warm-brown/70">Downtown Medical Center</p>
                        </div>
                        <div className="flex items-center space-x-1 mt-2 md:mt-0">
                          <div className="flex text-accent-yellow">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-warm-brown ml-2">4.9 (127 reviews)</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-vitality/10 text-vitality px-3 py-1 rounded-full text-sm">Nigerian Heritage</span>
                        <span className="bg-golden/10 text-golden-dark px-3 py-1 rounded-full text-sm">Yoruba Speaker</span>
                        <span className="bg-warm-orange/10 text-warm-orange px-3 py-1 rounded-full text-sm">Telehealth</span>
                      </div>
                      <p className="text-warm-brown mb-4">
                        "I understand the unique health challenges facing African communities and provide culturally sensitive care that honors traditional healing practices alongside modern medicine."
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          onClick={handleSignIn}
                          className="bg-golden hover:bg-golden-dark text-white px-6 py-2 rounded-xl transition-all"
                        >
                          Book Appointment
                        </Button>
                        <Button 
                          onClick={handleSignIn}
                          variant="outline"
                          className="border border-golden text-golden hover:bg-golden hover:text-white px-6 py-2 rounded-xl transition-all"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provider 2 */}
                <div className="border border-cream rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-sunset-gradient flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">CM</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-golden-dark">Dr. Carlos Mendoza</h3>
                          <p className="text-warm-brown">Cardiologist</p>
                          <p className="text-sm text-warm-brown/70">Heart & Wellness Clinic</p>
                        </div>
                        <div className="flex items-center space-x-1 mt-2 md:mt-0">
                          <div className="flex text-accent-yellow">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                            <Star className="w-4 h-4 text-gray-300" />
                          </div>
                          <span className="text-sm text-warm-brown ml-2">4.7 (89 reviews)</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-vitality/10 text-vitality px-3 py-1 rounded-full text-sm">Latino Heritage</span>
                        <span className="bg-golden/10 text-golden-dark px-3 py-1 rounded-full text-sm">Spanish Fluent</span>
                        <span className="bg-warm-orange/10 text-warm-orange px-3 py-1 rounded-full text-sm">In-Person</span>
                      </div>
                      <p className="text-warm-brown mb-4">
                        "Specializing in cardiovascular health with deep understanding of cultural factors affecting heart health in Latino communities."
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          onClick={handleSignIn}
                          className="bg-golden hover:bg-golden-dark text-white px-6 py-2 rounded-xl transition-all"
                        >
                          Book Appointment
                        </Button>
                        <Button 
                          onClick={handleSignIn}
                          variant="outline"
                          className="border border-golden text-golden hover:bg-golden hover:text-white px-6 py-2 rounded-xl transition-all"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-sunset-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Voices from Our Community
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Real stories from patients and providers who have found their perfect healthcare match
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Patient Testimonial */}
            <Card className="bg-white rounded-3xl shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src={happyPatient} 
                    alt="Happy patient enjoying outdoor wellness activity" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-golden-dark">Keisha Thompson</h4>
                    <p className="text-warm-brown">Patient since 2023</p>
                  </div>
                </div>
                <div className="flex text-accent-yellow mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-warm-brown text-lg leading-relaxed">
                  "For the first time in my life, I have a doctor who truly understands my cultural background and health needs. Dr. Okafor doesn't just treat my symptoms—she sees me as a whole person. The health journal feature helps her understand my daily routine and cultural practices that affect my wellness."
                </p>
              </CardContent>
            </Card>

            {/* Provider Testimonial */}
            <Card className="bg-white rounded-3xl shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-golden-gradient flex items-center justify-center">
                    <span className="text-white text-xl font-bold">DO</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-golden-dark">Dr. James Okoye</h4>
                    <p className="text-warm-brown">Internal Medicine</p>
                  </div>
                </div>
                <div className="flex text-accent-yellow mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-warm-brown text-lg leading-relaxed">
                  "Harmonia has transformed my practice. I can finally connect with patients who value cultural competency, and the platform's tools help me provide more personalized care. The daily health journals give me insights I never had before, making every appointment more meaningful and effective."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-warm-gradient rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-golden-dark mb-6">
              Ready to transform your healthcare experience?
            </h2>
            <p className="text-xl text-warm-brown mb-8 max-w-2xl mx-auto">
              Join thousands of patients and providers who have found their perfect healthcare match 
              through culturally competent care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleSignIn}
                className="bg-golden hover:bg-golden-dark text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Find Your Provider
              </Button>
              <Button 
                onClick={handleSignIn}
                variant="outline"
                className="border-2 border-golden text-golden hover:bg-golden hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
              >
                Join as Provider
              </Button>
            </div>
            <p className="text-sm text-warm-brown/70 mt-6">
              HIPAA compliant • Secure messaging • Culturally affirming care
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-golden-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img src={harmoniaLogo} alt="Harmonia Logo" className="h-10 w-10 rounded-full object-cover" />
                <span className="text-2xl font-bold">Harmonia</span>
              </div>
              <p className="text-white/80 mb-6">
                Connecting underserved communities with culturally competent healthcare providers 
                who understand your unique needs and heritage.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">For Patients</h4>
              <ul className="space-y-3 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Find Providers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Health Journal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Appointment Booking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Records</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cultural Resources</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">For Providers</h4>
              <ul className="space-y-3 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Join Network</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Provider Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Patient Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telehealth Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cultural Competency Training</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60">
            <p>&copy; 2023 Harmonia Health. All rights reserved. | Empowering culturally competent healthcare for all communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
