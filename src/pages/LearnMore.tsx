import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Shield, 
  BarChart3, 
  Stethoscope, 
  Calendar,
  FileText,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  User,
  Scan,
  Coins,
  Car,
  Brain,
  Video,
  BookOpen,
  Activity,
  Lock,
  Pill,
  TrendingUp,
  HeartPulse
} from 'lucide-react';

const LearnMore = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Scan className="h-8 w-8 text-blue-600" />,
      title: "Facial Recognition",
      description: "AI-powered patient identification using face-api.js with 75%+ accuracy, secure facial descriptors, and complete audit trails."
    },
    {
      icon: <Coins className="h-8 w-8 text-green-600" />,
      title: "CareCoin Blockchain Rewards",
      description: "Earn cryptocurrency for documentation. 50% to provider, 40% to patient, 10% founder fee. Cash out to real currency or gift cards."
    },
    {
      icon: <Car className="h-8 w-8 text-purple-600" />,
      title: "Integrated Ride Booking",
      description: "Uber/Lyft-style ride system with OpenStreetMap, real-time driver tracking, automatic matching, and CareCoin payments."
    },
    {
      icon: <Brain className="h-8 w-8 text-orange-600" />,
      title: "AI Clinical Decision Support",
      description: "OpenAI-powered differential diagnosis, treatment recommendations, drug interaction checking, and evidence-based guidelines."
    },
    {
      icon: <Video className="h-8 w-8 text-red-600" />,
      title: "Telemedicine Video Calls",
      description: "HIPAA-compliant WebRTC video conferencing with PeerJS, screen sharing, call recording, and encrypted peer-to-peer connections."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-yellow-600" />,
      title: "Patient Education Library",
      description: "Comprehensive health education resources with custom materials, multiple languages, reading levels, and easy sharing."
    },
    {
      icon: <Activity className="h-8 w-8 text-pink-600" />,
      title: "Predictive Analytics",
      description: "Real-time patient risk scoring, capacity forecasting, trend analysis, and data-driven insights for better outcomes."
    },
    {
      icon: <Lock className="h-8 w-8 text-indigo-600" />,
      title: "Role-Based Access Control",
      description: "Granular permissions for all healthcare roles with multi-factor authentication, trusted devices, and session management."
    },
    {
      icon: <Pill className="h-8 w-8 text-teal-600" />,
      title: "Medication Management",
      description: "Medication orders, interaction checking with clinical alerts, administration logs, and automated patient reminders."
    },
    {
      icon: <Calendar className="h-8 w-8 text-cyan-600" />,
      title: "Advanced Scheduling",
      description: "Provider calendars, resource reservations, equipment tracking, waitlist management, and automated SMS/email reminders."
    },
    {
      icon: <HeartPulse className="h-8 w-8 text-rose-600" />,
      title: "Care Coordination Hub",
      description: "Care team management, discharge planning, task assignment, and seamless collaboration across healthcare providers."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
      title: "HL7/FHIR Integrations",
      description: "Seamless healthcare system interoperability with HL7 message processing, external lab orders, and system mappings."
    }
  ];

  const benefits = [
    "Earn CareCoin cryptocurrency for every patient documentation",
    "AI-powered clinical decision support reduces diagnostic errors",
    "Facial recognition eliminates patient identification mistakes",
    "Integrated ride-booking improves patient appointment attendance",
    "Real-time telemedicine expands access to care",
    "Predictive analytics identifies at-risk patients early",
    "HIPAA-compliant with comprehensive audit trails",
    "Role-based access control protects sensitive data",
    "Automated workflows reduce administrative time by 40%",
    "Patient portal increases engagement and satisfaction",
    "HL7/FHIR integrations connect with existing systems",
    "Epic-format discharge summaries ensure continuity of care"
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Primary Care Physician",
      content: "Facesheet360 has transformed how I manage patient care. The intuitive interface and comprehensive features save me hours every day.",
      rating: 5
    },
    {
      name: "Maria Rodriguez, RN",
      role: "Registered Nurse",
      content: "The medication tracking and care plan features are outstanding. Patient safety has never been better managed.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Specialist",
      content: "The analytics and reporting capabilities provide insights that have genuinely improved patient outcomes in our practice.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="py-6 px-8 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Facesheet360</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/view-plans')}>
              View Plans
            </Button>
            <Button onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI + Blockchain + EHR = Healthcare Revolution
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Facesheet360 combines facial recognition AI, blockchain cryptocurrency rewards, integrated ride-booking, 
            telemedicine video calls, clinical decision support, and comprehensive EHR capabilities in one HIPAA-compliant platform.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/product-tour')} className="bg-gradient-to-r from-green-600 to-teal-600">
              Take Interactive Tour
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" onClick={() => navigate('/view-plans')}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/compare-ehr')}>
              Compare with Traditional EHR
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to deliver exceptional patient care and streamline your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] duration-300">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">And Much More...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Wound care with measurement tools and progress tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Virtual cards and bill payment integration</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Driver earnings platform with performance analytics</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">CareCoin staking and health rewards marketplace</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">PHI access logs and patient consent management</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Data retention policies and compliance center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Healthcare Professionals Choose Facesheet360
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of healthcare providers who have transformed their practice with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what medical professionals are saying about Facesheet360.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-600 text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have already revolutionized their patient care with Facesheet360.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/view-plans')} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/compare-ehr')}>
              Compare Features & Pricing
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/product-tour')}>
              Take Product Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-8 mb-6">
            <span className="text-2xl font-bold">Facesheet360</span>
          </div>
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Facesheet360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;