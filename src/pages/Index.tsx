import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Check, 
  Pill, 
  Calendar, 
  Bell, 
  Users,
  FileText,
  Scan,
  Coins,
  Car,
  Brain,
  Video,
  BookOpen,
  Shield,
  Activity,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Removed automatic redirect - let route protection handle it

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Scan className="h-8 w-8 text-health-500" />,
      title: "Facial Recognition",
      description: "AI-powered patient identification using facial recognition with 75%+ accuracy and secure descriptor storage."
    },
    {
      icon: <Coins className="h-8 w-8 text-health-500" />,
      title: "CareCoin Rewards",
      description: "Blockchain-based cryptocurrency rewards for healthcare documentation. Earn tokens for every data entry."
    },
    {
      icon: <Car className="h-8 w-8 text-health-500" />,
      title: "Ride Booking",
      description: "Integrated Uber-style ride booking with real-time driver matching, live tracking, and CareCoin payments."
    },
    {
      icon: <Brain className="h-8 w-8 text-health-500" />,
      title: "AI Clinical Support",
      description: "AI-powered clinical decision support with differential diagnosis, drug interactions, and risk assessment."
    },
    {
      icon: <Video className="h-8 w-8 text-health-500" />,
      title: "Telemedicine",
      description: "HIPAA-compliant WebRTC video conferencing with screen sharing, recording, and encrypted connections."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-health-500" />,
      title: "Patient Education",
      description: "Comprehensive health education library with custom materials, multilingual support, and easy sharing."
    },
    {
      icon: <Shield className="h-8 w-8 text-health-500" />,
      title: "Role-Based Access",
      description: "Granular RBAC for all healthcare roles with multi-factor authentication and comprehensive audit trails."
    },
    {
      icon: <Activity className="h-8 w-8 text-health-500" />,
      title: "Predictive Analytics",
      description: "Real-time patient risk scores, capacity forecasting, and data-driven insights to improve outcomes."
    }
  ];

  const testimonials = [
    {
      quote: "Facesheet360 has completely transformed our practice. The medication management system has reduced errors by 85%.",
      author: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      rating: 5
    },
    {
      quote: "The notification system ensures our patients never miss a dose. This platform has improved our patient outcomes dramatically.",
      author: "Dr. Michael Chen",
      role: "Cardiologist",
      rating: 5
    },
    {
      quote: "As a pharmacist, the prescription fulfillment feature has streamlined our workflow and improved coordination with physicians.",
      author: "Linda Rodriguez",
      role: "Lead Pharmacist",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-health-700 to-health-900 text-white dark:from-health-900 dark:to-health-700">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-6 py-16 md:py-24 md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl font-bold mb-4 md:text-5xl lg:text-6xl tracking-tight">
              Next-Generation Healthcare Platform
            </h1>
            <p className="text-xl mb-8 text-health-100">
              AI-powered EHR with facial recognition, blockchain rewards, telemedicine, ride-booking, 
              clinical decision support, and comprehensive patient management - all HIPAA compliant.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white">
                <Link to="/product-tour">Take Product Tour</Link>
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Link to="/view-plans">View Plans</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-health-700">
                <Link to="/compare-ehr">Compare with EHR</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl dark:bg-gray-800/30 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white text-center">Sign In to Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-health-700 hover:bg-white/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-white/80 text-sm">
                    Don't have an account?{" "}
                    <Link to="/login" className="text-white underline hover:text-white/80">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Revolutionary Healthcare Technology</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Combining artificial intelligence, blockchain technology, and comprehensive EHR capabilities to transform healthcare delivery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-custom-medium transition-all hover:shadow-custom-dark border border-gray-200 dark:border-gray-700 hover:scale-[1.02] duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Plus: Wound care tracking • Medication interactions • Care coordination • Patient portal • 
              HL7/FHIR integrations • Virtual cards • Health rewards marketplace • Driver earnings platform • 
              Automated reminders • Real-time analytics • Epic-format discharge summaries
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Healthcare Professionals Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Trusted by leading healthcare providers across the country.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-custom-medium border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Check 
                        key={i} 
                        className="h-5 w-5 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-health-800 text-white dark:bg-health-950">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare Practice?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who are improving patient care with our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white">
              <Link to="/product-tour">Take Interactive Tour</Link>
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Link to="/view-plans">View Plans</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white hover:bg-white hover:text-health-800">
              <Link to="/compare-ehr">Compare Features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
