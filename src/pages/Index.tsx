
import React from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  Pill, 
  Calendar, 
  Bell, 
  Users,
  FileText, 
  ChevronRight,
  Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <section className="relative bg-gradient-to-r from-health-700 to-health-900 text-white">
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
              <Button size="lg" className="bg-white text-health-800 hover:bg-health-100">
                <Link to="/dashboard">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/subscription">View Plans</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-10">
            <div className="relative bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <Pill className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Prescription</h3>
                  <p className="text-sm opacity-80">Manage medications</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <Calendar className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Appointments</h3>
                  <p className="text-sm opacity-80">Schedule visits</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <Bell className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Reminders</h3>
                  <p className="text-sm opacity-80">Stay on track</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <Users className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Patient Portal</h3>
                  <p className="text-sm opacity-80">Streamlined care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Healthcare Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our all-in-one solution provides everything healthcare professionals need to deliver exceptional care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medication Management Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Medication Management</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our medication management system connects doctors, pharmacists, and patients in a seamless workflow.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-green-500 flex-shrink-0" />
                  <span>Doctors can prescribe medications digitally with full medication history</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-green-500 flex-shrink-0" />
                  <span>Pharmacists receive prescriptions instantly and can update fulfillment status</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-green-500 flex-shrink-0" />
                  <span>Automated notifications for medication adherence and refill reminders</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-6 w-6 text-green-500 flex-shrink-0" />
                  <span>Track administration of medications by healthcare providers</span>
                </li>
              </ul>
              <Button className="mt-8 bg-health-600 hover:bg-health-700">
                <Link to="/charting">Explore Medication Tools</Link>
              </Button>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="bg-gray-100 p-6 rounded-xl shadow-inner">
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Atorvastatin 20mg</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Prescribed</span>
                  </div>
                  <p className="text-sm text-gray-600">Take 1 tablet daily at bedtime</p>
                  <div className="mt-3 flex justify-between text-sm text-gray-500">
                    <span>Dr. Emily Carter</span>
                    <span>Refills: 3</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Lisinopril 10mg</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Filled</span>
                  </div>
                  <p className="text-sm text-gray-600">Take 1 tablet daily in the morning</p>
                  <div className="mt-3 flex justify-between text-sm text-gray-500">
                    <span>Dr. Michael Chen</span>
                    <span>Pharmacy: Central Rx</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Medication Reminder</h4>
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-600">Metformin 500mg due in 30 minutes</p>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Mark as Taken
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Healthcare Professionals Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by leading healthcare providers across the country.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-health-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare Practice?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who are improving patient care with our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-health-800 hover:bg-health-100">
              <Link to="/subscription">Subscribe Now</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link to="/dashboard">Try Dashboard</Link>
            </Button>
          </div>
          <p className="mt-6 text-health-200">
            Secure payments processed through CashApp - $mycashdirect2022
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
