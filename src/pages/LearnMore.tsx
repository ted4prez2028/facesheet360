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
  User
} from 'lucide-react';

const LearnMore = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Patient Management",
      description: "Comprehensive patient records, medical history, and care coordination in one secure platform."
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Appointment Scheduling",
      description: "Smart scheduling system with automated reminders and seamless calendar integration."
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: "Electronic Health Records",
      description: "Complete EHR system with charting, documentation, and compliance features."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Analytics & Reporting",
      description: "Real-time insights and detailed reports to improve patient outcomes and operational efficiency."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "HIPAA Compliance",
      description: "Enterprise-grade security with full HIPAA compliance and end-to-end encryption."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "AI-Powered Tools",
      description: "Advanced AI features for wound assessment, health predictions, and clinical decision support."
    }
  ];

  const benefits = [
    "Reduce administrative overhead by up to 40%",
    "Improve patient satisfaction scores",
    "Streamline workflow and reduce errors",
    "Access patient data from anywhere, anytime",
    "Automated billing and insurance processing",
    "Real-time collaboration tools for care teams"
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
            The Future of Healthcare Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover how Facesheet360 revolutionizes patient care with cutting-edge technology, 
            intuitive design, and comprehensive healthcare management tools.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/view-plans')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
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
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
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
            <Button size="lg" onClick={() => navigate('/view-plans')}>
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
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