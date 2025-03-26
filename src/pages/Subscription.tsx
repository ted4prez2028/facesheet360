
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import CashAppPayment from "@/components/subscription/CashAppPayment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

// Define subscription plans
const SUBSCRIPTION_PLANS = [
  {
    id: 'doctor',
    title: 'Doctor',
    role: 'doctor' as const,
    price: 250,
    features: [
      'Full patient access',
      'Diagnosis and treatment planning',
      'Prescription management',
      'Advanced analytics',
      'Unlimited charting'
    ]
  },
  {
    id: 'nurse',
    title: 'Nurse',
    role: 'nurse' as const,
    price: 100,
    features: [
      'Patient vitals tracking',
      'Medication administration',
      'Basic charting access',
      'Patient education tools',
      'Care plan implementation'
    ]
  },
  {
    id: 'therapist',
    title: 'Therapist',
    role: 'therapist' as const,
    price: 150,
    features: [
      'Therapy session notes',
      'Treatment plan creation',
      'Patient progress tracking',
      'Assessment tools',
      'Exercise prescription'
    ]
  },
  {
    id: 'cna',
    title: 'CNA',
    role: 'cna' as const,
    price: 80,
    features: [
      'Basic patient care notes',
      'Vital signs recording',
      'Activity logging',
      'Care task management',
      'Shift reporting'
    ]
  }
];

enum SubscriptionStep {
  SELECT_PLAN,
  PAYMENT,
  CONFIRMATION
}

const Subscription = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0]);
  const [currentStep, setCurrentStep] = useState<SubscriptionStep>(SubscriptionStep.SELECT_PLAN);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSelectPlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    setSelectedPlan(plan);
  };
  
  const handleProceedToPayment = () => {
    setCurrentStep(SubscriptionStep.PAYMENT);
  };
  
  const handleCancelPayment = () => {
    setCurrentStep(SubscriptionStep.SELECT_PLAN);
  };
  
  const handlePaymentComplete = async () => {
    setIsProcessing(true);
    
    try {
      // Update user's role based on the selected plan
      if (user) {
        await updateUserProfile({
          role: selectedPlan.role
        });
        
        toast({
          title: "Subscription updated",
          description: `Your account has been updated to ${selectedPlan.title} role`,
        });
        
        setCurrentStep(SubscriptionStep.CONFIRMATION);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <DashboardLayout>
      <div className="container py-6 space-y-8">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
            <p className="text-muted-foreground">
              Choose your subscription plan and access level
            </p>
          </div>
        </div>
        
        {user?.role && currentStep === SubscriptionStep.SELECT_PLAN && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Current Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</AlertTitle>
            <AlertDescription>
              Your current role will be changed when you complete the subscription process.
            </AlertDescription>
          </Alert>
        )}
        
        {currentStep === SubscriptionStep.SELECT_PLAN && (
          <>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-[200px] grid-cols-2 mb-8">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual" disabled>Annual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <SubscriptionCard
                      key={plan.id}
                      plan={plan}
                      onSelect={handleSelectPlan}
                      isSelected={selectedPlan.id === plan.id}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center mt-8">
              <Button size="lg" onClick={handleProceedToPayment}>
                Continue with {selectedPlan.title} Plan
              </Button>
            </div>
          </>
        )}
        
        {currentStep === SubscriptionStep.PAYMENT && (
          <div className="max-w-xl mx-auto">
            <CashAppPayment
              amount={selectedPlan.price}
              purchaseType={selectedPlan.title}
              onComplete={handlePaymentComplete}
              onCancel={handleCancelPayment}
            />
          </div>
        )}
        
        {currentStep === SubscriptionStep.CONFIRMATION && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Subscription Confirmed!</h2>
            <p className="text-muted-foreground">
              Your account has been updated to {selectedPlan.title} role. You now have access to all features included in your plan.
            </p>
            <Button size="lg" onClick={handleReturnToDashboard}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
