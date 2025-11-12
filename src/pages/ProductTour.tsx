import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Scan, 
  Coins, 
  Car, 
  Video,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  Smartphone,
  MapPin,
  DollarSign,
  Users,
  Brain,
  Activity,
  Camera,
  Wallet,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProductTour = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Facesheet360',
      description: 'The next-generation healthcare platform combining AI, blockchain, and comprehensive EHR capabilities.',
      icon: <Activity className="h-16 w-16 text-blue-600" />,
      features: [
        'AI-powered clinical decision support',
        'Blockchain CareCoin rewards system',
        'Integrated ride-booking service',
        'HIPAA-compliant telemedicine',
        'Comprehensive patient management'
      ],
      image: '🏥',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'facial-recognition',
      title: 'Facial Recognition Patient ID',
      description: 'Revolutionary AI-powered patient identification using facial recognition technology.',
      icon: <Scan className="h-16 w-16 text-green-600" />,
      features: [
        'Register patient faces with 75%+ accuracy requirement',
        'Secure facial descriptor storage (not actual photos)',
        'Quick patient identification at check-in',
        'Complete audit trail of all identifications',
        'Multiple face registrations for accuracy over time'
      ],
      howItWorks: [
        { step: 'Register', description: 'Capture patient face during initial registration', icon: <Camera /> },
        { step: 'Store', description: 'Convert to encrypted facial descriptors', icon: <Activity /> },
        { step: 'Identify', description: 'Match face at future visits (60%+ threshold)', icon: <CheckCircle /> },
        { step: 'Audit', description: 'Track all access with timestamps and confidence', icon: <Users /> }
      ],
      image: '🎯',
      color: 'from-green-500 to-teal-600',
      stats: [
        { label: 'Accuracy', value: '75%+', icon: <Star /> },
        { label: 'Speed', value: '<2s', icon: <Activity /> },
        { label: 'Security', value: 'HIPAA', icon: <CheckCircle /> }
      ]
    },
    {
      id: 'carecoin-rewards',
      title: 'CareCoin Blockchain Rewards',
      description: 'Earn cryptocurrency for every healthcare documentation action. Real blockchain tokens with real value.',
      icon: <Coins className="h-16 w-16 text-yellow-600" />,
      features: [
        'Earn tokens for EVERY data entry (vitals, meds, notes, wounds)',
        '50% to healthcare provider, 40% to patient, 10% founder fee',
        'Cash out to bank, PayPal, Venmo, or gift cards',
        'Exchange rate: 1 CareCoin = $0.50 USD',
        'Complete transaction transparency with blockchain hashes'
      ],
      howItWorks: [
        { step: 'Document', description: 'Add patient vitals, medications, or notes', icon: <Activity /> },
        { step: 'Mint', description: 'Blockchain tokens automatically generated', icon: <Coins /> },
        { step: 'Distribute', description: 'Split tokens: provider, patient, founder', icon: <Users /> },
        { step: 'Redeem', description: 'Cash out to real money or gift cards', icon: <DollarSign /> }
      ],
      image: '💰',
      color: 'from-yellow-500 to-orange-600',
      stats: [
        { label: 'Per Entry', value: '10 CC', icon: <Coins /> },
        { label: 'USD Value', value: '$0.50', icon: <DollarSign /> },
        { label: 'Monthly Avg', value: '$250+', icon: <Star /> }
      ]
    },
    {
      id: 'ride-booking',
      title: 'Integrated Ride Booking',
      description: 'Uber/Lyft-style ride service for healthcare appointments. Pay with CareCoins or cash.',
      icon: <Car className="h-16 w-16 text-purple-600" />,
      features: [
        'Real-time driver matching based on proximity',
        'Live driver location tracking during pickup',
        'OpenStreetMap integration for route display',
        'Pay with CareCoins or traditional payment',
        'Driver ratings and performance analytics'
      ],
      howItWorks: [
        { step: 'Request', description: 'Enter pickup and dropoff locations', icon: <MapPin /> },
        { step: 'Match', description: 'Auto-assign nearest available driver', icon: <Users /> },
        { step: 'Track', description: 'Watch driver approach in real-time', icon: <Activity /> },
        { step: 'Pay', description: 'Complete ride with CareCoin or card', icon: <Wallet /> }
      ],
      image: '🚗',
      color: 'from-purple-500 to-pink-600',
      stats: [
        { label: 'Avg Wait', value: '5 min', icon: <Activity /> },
        { label: 'With CC', value: '-20%', icon: <Coins /> },
        { label: 'Rating', value: '4.8★', icon: <Star /> }
      ]
    },
    {
      id: 'telemedicine',
      title: 'HIPAA-Compliant Telemedicine',
      description: 'Secure WebRTC video conferencing for remote patient consultations.',
      icon: <Video className="h-16 w-16 text-red-600" />,
      features: [
        'Peer-to-peer encrypted video calls using PeerJS',
        'Screen sharing for reviewing test results',
        'Call recording with patient consent',
        'Real-time video quality with WebGL backend',
        'Integrated with appointment scheduling'
      ],
      howItWorks: [
        { step: 'Schedule', description: 'Book video appointment in calendar', icon: <Activity /> },
        { step: 'Connect', description: 'Join secure peer-to-peer session', icon: <Video /> },
        { step: 'Consult', description: 'Video chat with screen sharing', icon: <Users /> },
        { step: 'Document', description: 'Auto-save notes and earn CareCoins', icon: <Coins /> }
      ],
      image: '📹',
      color: 'from-red-500 to-pink-600',
      stats: [
        { label: 'Latency', value: '<100ms', icon: <Activity /> },
        { label: 'Quality', value: '1080p', icon: <Video /> },
        { label: 'Uptime', value: '99.9%', icon: <CheckCircle /> }
      ]
    },
    {
      id: 'clinical-ai',
      title: 'AI Clinical Decision Support',
      description: 'OpenAI-powered clinical recommendations, drug interactions, and risk assessment.',
      icon: <Brain className="h-16 w-16 text-indigo-600" />,
      features: [
        'Differential diagnosis suggestions based on symptoms',
        'Evidence-based treatment recommendations',
        'Real-time medication interaction checking',
        'Patient risk scoring and predictions',
        'Clinical alerts with severity-based prioritization'
      ],
      howItWorks: [
        { step: 'Analyze', description: 'AI reviews patient symptoms and history', icon: <Brain /> },
        { step: 'Suggest', description: 'Generate differential diagnosis options', icon: <Activity /> },
        { step: 'Check', description: 'Flag drug interactions and risks', icon: <CheckCircle /> },
        { step: 'Alert', description: 'Notify providers of critical findings', icon: <Users /> }
      ],
      image: '🧠',
      color: 'from-indigo-500 to-purple-600',
      stats: [
        { label: 'Accuracy', value: '94%', icon: <Star /> },
        { label: 'Speed', value: '<3s', icon: <Activity /> },
        { label: 'Saved', value: '2hr/day', icon: <CheckCircle /> }
      ]
    },
    {
      id: 'get-started',
      title: 'Ready to Transform Healthcare?',
      description: 'Join thousands of healthcare professionals already using Facesheet360.',
      icon: <PlayCircle className="h-16 w-16 text-green-600" />,
      features: [
        'Start with our 30-day free trial',
        'No credit card required to explore',
        'Complete onboarding and training included',
        'Dedicated support team for implementation',
        'Flexible pricing for facilities of all sizes'
      ],
      cta: [
        { label: 'View Pricing Plans', action: '/view-plans', primary: true },
        { label: 'Compare with Traditional EHR', action: '/compare-ehr', primary: false },
        { label: 'Talk to Sales', action: '/learn-more', primary: false }
      ],
      image: '🚀',
      color: 'from-green-500 to-blue-600'
    }
  ];

  const currentStepData = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/view-plans');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="py-6 px-8 bg-white shadow-sm border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Facesheet360 Tour</h1>
            <p className="text-sm text-gray-600">Interactive Product Walkthrough</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              Exit Tour
            </Button>
            <Button onClick={handleSkip}>
              Skip to Pricing
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
        />
      </div>

      {/* Step Counter */}
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tourSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-blue-600' 
                    : index < currentStep 
                    ? 'w-2 bg-green-500' 
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
              />
            ))}
          </div>
          <Badge variant="outline">
            Step {currentStep + 1} of {tourSteps.length}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        <div className={`bg-gradient-to-r ${currentStepData.color} rounded-3xl p-1 shadow-2xl`}>
          <Card className="border-0 bg-white">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  {currentStepData.icon}
                </div>
              </div>
              <div className="text-6xl mb-4">{currentStepData.image}</div>
              <CardTitle className="text-4xl mb-4">{currentStepData.title}</CardTitle>
              <CardDescription className="text-xl max-w-2xl mx-auto text-gray-600">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Key Features */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-center">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {currentStepData.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              {currentStepData.howItWorks && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-center">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {currentStepData.howItWorks.map((step, index) => (
                      <div key={index} className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="p-4 bg-white rounded-xl shadow-md">
                            {React.cloneElement(step.icon, { className: 'h-8 w-8 text-blue-600' })}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600 mb-2">
                          {index + 1}. {step.step}
                        </div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {currentStepData.stats && (
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                  {currentStepData.stats.map((stat, index) => (
                    <Card key={index} className="border-2 border-blue-100">
                      <CardContent className="pt-6 text-center">
                        <div className="flex justify-center mb-2">
                          {React.cloneElement(stat.icon, { className: 'h-6 w-6 text-blue-600' })}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* CTA Buttons for Last Step */}
              {currentStepData.cta && (
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  {currentStepData.cta.map((cta, index) => (
                    <Button
                      key={index}
                      size="lg"
                      variant={cta.primary ? "default" : "outline"}
                      onClick={() => navigate(cta.action)}
                      className={cta.primary ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : ""}
                    >
                      {cta.label}
                      {cta.primary && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 max-w-4xl mx-auto">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="min-w-[140px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < tourSteps.length - 1 ? (
            <Button
              size="lg"
              onClick={handleNext}
              className="min-w-[140px] bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate('/view-plans')}
              className="min-w-[140px] bg-gradient-to-r from-green-600 to-blue-600"
            >
              Get Started
              <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-8 bg-white border-t mt-16">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">
            Questions? <button onClick={() => navigate('/learn-more')} className="text-blue-600 hover:underline">Contact our team</button>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductTour;
