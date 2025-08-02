
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, CreditCard, Smartphone } from 'lucide-react';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import CashAppPayment from '@/components/subscription/CashAppPayment';
import { useAuth } from '@/context/AuthContext';
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
      '5GB storage'
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
      'API access'
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
      '10GB storage'
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
      'Video sessions'
    ]
  }
];

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cashapp' | null>(null);
  const [showCashAppPayment, setShowCashAppPayment] = useState(false);
  const [cashAppData, setCashAppData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setShowCashAppPayment(false);
  };

  const handlePaymentMethod = async (method: 'stripe' | 'cashapp') => {
    if (!selectedPlan || !user) return;
    
    setIsLoading(true);
    setPaymentMethod(method);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {
          planId: selectedPlan.id,
          planName: selectedPlan.title,
          price: selectedPlan.price,
          paymentMethod: method
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
        toast.success('Payment verified! Your subscription is now active.');
        setShowCashAppPayment(false);
        setSelectedPlan(null);
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select a subscription plan that fits your healthcare practice needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <Card className="max-w-md mx-auto border-2 border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
              You've Selected
            </CardTitle>
            <CardDescription className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {selectedPlan.title} - ${selectedPlan.price}/month
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Plan includes:</h4>
              <ul className="space-y-2">
                {selectedPlan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center justify-center text-gray-700 dark:text-gray-300">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                {selectedPlan.features.length > 3 && (
                  <li className="text-gray-600 dark:text-gray-400">
                    +{selectedPlan.features.length - 3} more features
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Cancel anytime. No long-term contracts.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Need a Custom Solution?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          For large healthcare organizations or unique requirements, we offer custom enterprise solutions.
        </p>
        <Button variant="outline" size="lg" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default Subscription;
