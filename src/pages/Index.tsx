
import React from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  Pill, 
  Calendar, 
  Bell, 
  Users,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const Index = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-health-500" />,
      title: "Patient Management",
      description: "Easily manage patient records, track appointments, and maintain comprehensive medical histories."
    },
    {
      icon: <Calendar className="h-8 w-8 text-health-500" />,
      title: "Scheduling",
      description: "Streamlined appointment scheduling with automated reminders to reduce no-shows."
    },
    {
      icon: <FileText className="h-8 w-8 text-health-500" />,
      title: "Digital Charting",
      description: "Comprehensive electronic health records with secure access and intuitive navigation."
    },
    {
      icon: <Pill className="h-8 w-8 text-health-500" />,
      title: "Medication Management",
      description: "Prescribe, track, and manage medications with automated reminders for patients."
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
              Healthcare Management Simplified
            </h1>
            <p className="text-xl mb-8 text-health-100">
              The complete platform for healthcare professionals to manage patients, appointments, 
              medications, and more - all in one secure place.
            </p>
            <div className="space-x-4">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                <Link to="/dashboard">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-health-800">
                <Link to="/subscription">View Plans</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="relative bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl dark:bg-gray-800/30 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 p-4 rounded-lg dark:bg-gray-700/40">
                  <Pill className="h-8 w-8 mb-2 text-white" />
                  <h3 className="font-medium text-white">Prescription</h3>
                  <p className="text-sm opacity-80 text-white">Manage medications</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg dark:bg-gray-700/40">
                  <Calendar className="h-8 w-8 mb-2 text-white" />
                  <h3 className="font-medium text-white">Appointments</h3>
                  <p className="text-sm opacity-80 text-white">Schedule visits</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg dark:bg-gray-700/40">
                  <Bell className="h-8 w-8 mb-2 text-white" />
                  <h3 className="font-medium text-white">Reminders</h3>
                  <p className="text-sm opacity-80 text-white">Stay on track</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg dark:bg-gray-700/40">
                  <Users className="h-8 w-8 mb-2 text-white" />
                  <h3 className="font-medium text-white">Patient Portal</h3>
                  <p className="text-sm opacity-80 text-white">Streamlined care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Comprehensive Healthcare Platform</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our all-in-one solution provides everything healthcare professionals need to deliver exceptional care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-custom-medium transition-all hover:shadow-custom-dark border border-gray-200 dark:border-gray-700 hover:scale-[1.02] duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
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
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
              <Link to="/dashboard">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-health-800 dark:hover:text-health-950">
              <Link to="/subscription">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
