import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, CreditCard, Smartphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import CashAppPayment from '@/components/subscription/CashAppPayment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  title: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna';
  price: number;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'doctor-basic',
    title: 'Doctor Basic',
    role: 'doctor',
    price: 49,
    features: [
      'Up to 50 patients',
      'Basic charting tools',
      'Appointment scheduling',
      'Email support',
      '5GB storage',
      'Mobile app access',
      'Basic reporting'
    ]
  },
  {
    id: 'doctor-pro',
    title: 'Doctor Pro',
    role: 'doctor',
    price: 99,
    popular: true,
    features: [
      'Unlimited patients',
      'Advanced charting & analytics',
      'Telemedicine integration',
      'Priority support',
      '50GB storage',
      'Custom templates',
      'API access',
      'Advanced reporting',
      'AI-powered insights',
      'Multi-location support'
    ]
  },
  {
    id: 'nurse-standard',
    title: 'Nurse Standard',
    role: 'nurse',
    price: 29,
    features: [
      'Patient care management',
      'Medication tracking',
      'Shift scheduling',
      'Team collaboration',
      '10GB storage',
      'Mobile notifications',
      'Care plan management'
    ]
  },
  {
    id: 'therapist-pro',
    title: 'Therapist Pro',
    role: 'therapist',
    price: 69,
    features: [
      'Session management',
      'Progress tracking',
      'Treatment plans',
      'Insurance billing',
      '25GB storage',
      'Video sessions',
      'Outcome measurements',
      'Custom assessments'
    ]
  }
];

const ViewPlans = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cashapp' | null>(null);
  const [showCashAppPayment, setShowCashAppPayment] = useState(false);
  const [cashAppData, setCashAppData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setShowCashAppPayment(false);
  };

  const handlePaymentMethod = async (method: 'stripe' | 'cashapp') => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    setPaymentMethod(method);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {
          planId: selectedPlan.id,
          planName: selectedPlan.title,
          price: selectedPlan.price,
          paymentMethod: method,
          guestCheckout: true // Allow guest checkout on this page
        }
      });

      if (error) throw error;

      if (method === 'cashapp') {
        setCashAppData(data);
        setShowCashAppPayment(true);
      } else if (method === 'stripe' && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashAppComplete = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-cashapp-payment', {
        body: { subscriptionId: cashAppData?.subscriptionId }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Payment verified! Please login to activate your subscription.');
        setShowCashAppPayment(false);
        setSelectedPlan(null);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify payment. Please contact support.');
    }
  };

  if (showCashAppPayment && cashAppData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="py-6 px-8 bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Facesheet360</h1>
            <Button variant="ghost" onClick={() => setShowCashAppPayment(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CashAppPayment
            amount={cashAppData.amount}
            purchaseType="subscription"
            cashAppHandle={cashAppData.cashAppHandle}
            instructions={cashAppData.instructions}
            onComplete={handleCashAppComplete}
            onCancel={() => setShowCashAppPayment(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="py-6 px-8 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Facesheet360</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/learn-more')}>
              Learn More
            </Button>
            <Button onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Select a subscription plan that fits your healthcare practice needs. 
            All plans include a 30-day free trial with full access to premium features.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              30-day free trial
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              24/7 support
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}
              <SubscriptionCard
                plan={plan}
                onSelect={handleSelectPlan}
                isSelected={selectedPlan?.id === plan.id}
              />
            </div>
          ))}
        </div>

        {selectedPlan && (
          <Card className="max-w-lg mx-auto border-2 border-primary bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">
                Complete Your Purchase
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-gray-800">
                {selectedPlan.title} - ${selectedPlan.price}/month
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-900">Plan includes:</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center justify-center text-gray-700">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {selectedPlan.features.length > 4 && (
                    <li className="text-gray-600">
                      +{selectedPlan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => handlePaymentMethod('stripe')}
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isLoading && paymentMethod === 'stripe' ? 'Processing...' : 'Pay with Stripe'}
                </Button>
                
                <Button 
                  onClick={() => handlePaymentMethod('cashapp')}
                  size="lg"
                  variant="outline"
                  disabled={isLoading}
                  className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  {isLoading && paymentMethod === 'cashapp' ? 'Setting up...' : 'Pay with CashApp'}
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  🎉 Special Launch Offer
                </p>
                <p className="text-sm text-blue-700">
                  Start your 30-day free trial today. No credit card required during trial period.
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Cancel anytime. No long-term contracts. Full support included.
              </p>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">Absolutely. We use enterprise-grade encryption and are fully HIPAA compliant to protect your patient data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer support?</h3>
              <p className="text-gray-600">Yes, all plans include 24/7 customer support with priority support for Pro plans.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time with no cancellation fees or penalties.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-8 bg-gray-900 text-white mt-20">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Facesheet360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ViewPlans;