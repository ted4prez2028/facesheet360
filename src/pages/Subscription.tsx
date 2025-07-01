
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = () => {
    if (selectedPlan) {
      // Implement subscription logic here
      console.log('Subscribing to:', selectedPlan);
    }
  };

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
            <Button 
              onClick={handleSubscribe}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              Subscribe Now
            </Button>
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
