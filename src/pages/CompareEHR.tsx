import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X,
  ArrowRight,
  Zap,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Download,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CompareEHR = () => {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const comparisonFeatures = [
    {
      category: 'Core EHR Features',
      icon: <FileText className="h-5 w-5" />,
      features: [
        { name: 'Electronic Health Records', facesheet360: true, traditional: true },
        { name: 'Patient Demographics', facesheet360: true, traditional: true },
        { name: 'Medical History', facesheet360: true, traditional: true },
        { name: 'Medication Orders', facesheet360: true, traditional: true },
        { name: 'Lab Results', facesheet360: true, traditional: true },
        { name: 'SOAP Notes', facesheet360: true, traditional: true },
        { name: 'Vital Signs Tracking', facesheet360: true, traditional: true },
        { name: 'Discharge Summaries', facesheet360: 'Epic Format', traditional: 'Basic' }
      ]
    },
    {
      category: 'AI & Advanced Technology',
      icon: <Zap className="h-5 w-5" />,
      features: [
        { name: 'Facial Recognition Patient ID', facesheet360: '75%+ accuracy', traditional: false },
        { name: 'AI Clinical Decision Support', facesheet360: 'OpenAI powered', traditional: 'Rule-based only' },
        { name: 'Medication Interaction Checking', facesheet360: 'Real-time AI', traditional: 'Basic database' },
        { name: 'Predictive Analytics', facesheet360: 'Real-time risk scoring', traditional: false },
        { name: 'Wound Assessment AI', facesheet360: 'Measurement tools', traditional: false },
        { name: 'Differential Diagnosis', facesheet360: true, traditional: false },
        { name: 'Treatment Recommendations', facesheet360: 'Evidence-based', traditional: false }
      ]
    },
    {
      category: 'Financial Incentives',
      icon: <DollarSign className="h-5 w-5" />,
      features: [
        { name: 'Cryptocurrency Rewards', facesheet360: 'CareCoin blockchain', traditional: false },
        { name: 'Earn for Documentation', facesheet360: '10 CC per entry', traditional: false },
        { name: 'Patient Rewards', facesheet360: '40% of tokens', traditional: false },
        { name: 'Cash Out Options', facesheet360: 'Bank/PayPal/Gift cards', traditional: false },
        { name: 'Provider Earnings', facesheet360: '50% of tokens', traditional: false },
        { name: 'Token Exchange Rate', facesheet360: '$0.50 per CC', traditional: false },
        { name: 'Blockchain Transparency', facesheet360: true, traditional: false }
      ]
    },
    {
      category: 'Patient Transportation',
      icon: <Smartphone className="h-5 w-5" />,
      features: [
        { name: 'Integrated Ride Booking', facesheet360: 'Uber/Lyft-style', traditional: false },
        { name: 'Real-time Driver Tracking', facesheet360: true, traditional: false },
        { name: 'Automatic Driver Matching', facesheet360: 'Proximity-based', traditional: false },
        { name: 'CareCoin Payment Option', facesheet360: '20% discount', traditional: false },
        { name: 'Driver Performance Analytics', facesheet360: true, traditional: false },
        { name: 'Patient Rating System', facesheet360: true, traditional: false },
        { name: 'Ride History with Maps', facesheet360: true, traditional: false }
      ]
    },
    {
      category: 'Telemedicine',
      icon: <Users className="h-5 w-5" />,
      features: [
        { name: 'Video Conferencing', facesheet360: 'WebRTC P2P', traditional: 'Cloud-based' },
        { name: 'Screen Sharing', facesheet360: true, traditional: 'Limited' },
        { name: 'Call Recording', facesheet360: 'With consent', traditional: 'Extra cost' },
        { name: 'HIPAA Compliance', facesheet360: 'End-to-end encrypted', traditional: 'Yes' },
        { name: 'Integration with Scheduling', facesheet360: true, traditional: 'Separate system' },
        { name: 'Video Quality', facesheet360: '1080p', traditional: '720p' },
        { name: 'Mobile Support', facesheet360: true, traditional: 'Limited' }
      ]
    },
    {
      category: 'Security & Compliance',
      icon: <Shield className="h-5 w-5" />,
      features: [
        { name: 'HIPAA Compliant', facesheet360: true, traditional: true },
        { name: 'Role-Based Access Control', facesheet360: '9 healthcare roles', traditional: '3-5 roles' },
        { name: 'Multi-Factor Authentication', facesheet360: true, traditional: 'Add-on' },
        { name: 'Comprehensive Audit Trails', facesheet360: true, traditional: 'Basic' },
        { name: 'PHI Access Logging', facesheet360: 'Real-time alerts', traditional: 'Periodic reports' },
        { name: 'Data Encryption', facesheet360: 'End-to-end', traditional: 'At rest only' },
        { name: 'Patient Consent Management', facesheet360: true, traditional: 'Manual' }
      ]
    },
    {
      category: 'Integrations & Interoperability',
      icon: <TrendingUp className="h-5 w-5" />,
      features: [
        { name: 'HL7 Interface', facesheet360: true, traditional: 'Extra cost' },
        { name: 'FHIR API', facesheet360: true, traditional: 'Limited' },
        { name: 'External Lab Orders', facesheet360: true, traditional: true },
        { name: 'Pharmacy Integration', facesheet360: true, traditional: true },
        { name: 'Insurance Claims', facesheet360: 'Automated', traditional: 'Manual/Semi-automated' },
        { name: 'Third-party Apps', facesheet360: 'Open API', traditional: 'Restricted' }
      ]
    },
    {
      category: 'User Experience',
      icon: <Clock className="h-5 w-5" />,
      features: [
        { name: 'Modern Interface', facesheet360: 'React/Tailwind', traditional: 'Legacy UI' },
        { name: 'Mobile Responsive', facesheet360: true, traditional: 'Limited' },
        { name: 'Learning Curve', facesheet360: '2-3 days', traditional: '2-3 weeks' },
        { name: 'Customizable Workflows', facesheet360: true, traditional: 'Limited' },
        { name: 'Dark Mode', facesheet360: true, traditional: false },
        { name: 'Patient Portal', facesheet360: 'Full-featured', traditional: 'Basic' },
        { name: 'Patient Education Library', facesheet360: 'Comprehensive', traditional: 'Links only' }
      ]
    }
  ];

  const pricingComparison = [
    {
      tier: 'Small Practice (1-5 providers)',
      facesheet360: {
        price: '$299/month',
        features: ['All features included', 'Unlimited patients', 'CareCoin earnings', '24/7 support'],
        annual: '$2,990 ($250/mo)'
      },
      traditional: {
        price: '$549-899/month',
        features: ['Limited features', 'Per-provider fees', 'Add-ons extra', 'Business hours support'],
        annual: '$5,990-9,990/year'
      }
    },
    {
      tier: 'Medium Practice (6-20 providers)',
      facesheet360: {
        price: '$799/month',
        features: ['All features + API access', 'Priority support', 'Custom training', 'Dedicated account manager'],
        annual: '$7,990 ($666/mo)'
      },
      traditional: {
        price: '$2,500-5,000/month',
        features: ['Core features', 'Per-provider fees', 'Limited integrations', 'Standard support'],
        annual: '$30,000-60,000/year'
      }
    },
    {
      tier: 'Large Facility (20+ providers)',
      facesheet360: {
        price: 'Custom pricing',
        features: ['Enterprise features', 'White-label option', 'On-premise deployment', 'SLA guarantees'],
        annual: 'Contact sales'
      },
      traditional: {
        price: '$10,000+/month',
        features: ['Full feature set', 'Complex implementation', 'Long-term contracts', 'Variable support'],
        annual: '$120,000+/year'
      }
    }
  ];

  const migrationSteps = [
    {
      step: 1,
      title: 'Assessment & Planning',
      duration: '1-2 weeks',
      description: 'Evaluate your current EHR system, identify data to migrate, and create implementation timeline.',
      tasks: [
        'Current system audit',
        'Data mapping analysis',
        'Staff training schedule',
        'Go-live date planning'
      ]
    },
    {
      step: 2,
      title: 'Data Export & Preparation',
      duration: '2-3 weeks',
      description: 'Export data from your current system and prepare it for import into Facesheet360.',
      tasks: [
        'Export patient records',
        'Clean and validate data',
        'Format conversion',
        'Test data integrity'
      ]
    },
    {
      step: 3,
      title: 'System Configuration',
      duration: '1 week',
      description: 'Configure Facesheet360 to match your workflows, preferences, and compliance requirements.',
      tasks: [
        'User roles setup',
        'Workflow customization',
        'Templates creation',
        'Integration configuration'
      ]
    },
    {
      step: 4,
      title: 'Data Migration',
      duration: '1 week',
      description: 'Import your data into Facesheet360 with validation and verification at each step.',
      tasks: [
        'Initial data import',
        'Validation and verification',
        'Error correction',
        'Final data sync'
      ]
    },
    {
      step: 5,
      title: 'Staff Training',
      duration: '1-2 weeks',
      description: 'Comprehensive training for all staff members on Facesheet360 features and workflows.',
      tasks: [
        'Administrator training',
        'Provider training sessions',
        'Support staff training',
        'Hands-on practice'
      ]
    },
    {
      step: 6,
      title: 'Go-Live & Support',
      duration: 'Ongoing',
      description: 'Launch Facesheet360 with dedicated support team monitoring for smooth transition.',
      tasks: [
        'Parallel system operation',
        'Real-time support',
        'Issue resolution',
        'Performance optimization'
      ]
    }
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="py-6 px-8 bg-white shadow-sm border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Facesheet360 vs Traditional EHR
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive feature and pricing comparison</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button onClick={() => navigate('/product-tour')}>
              Take Product Tour
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Why Healthcare Providers Are Switching to Facesheet360
          </h2>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-blue-100">
            Compare features, pricing, and migration process side-by-side with traditional EHR systems
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 bg-white/10 backdrop-blur text-white">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold mb-1">40%</div>
                <div className="text-sm text-blue-100">Cost Savings</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/10 backdrop-blur text-white">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold mb-1">2-3 Days</div>
                <div className="text-sm text-blue-100">Learning Curve</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/10 backdrop-blur text-white">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold mb-1">$250+</div>
                <div className="text-sm text-blue-100">Monthly CC Earnings</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/10 backdrop-blur text-white">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold mb-1">6 Weeks</div>
                <div className="text-sm text-blue-100">Migration Time</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Comparison Tabs */}
      <section className="py-16 px-8">
        <div className="container mx-auto">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="features" className="text-lg">
                Feature Comparison
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-lg">
                Pricing Comparison
              </TabsTrigger>
              <TabsTrigger value="migration" className="text-lg">
                Migration Guide
              </TabsTrigger>
            </TabsList>

            {/* Features Comparison */}
            <TabsContent value="features" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Detailed Feature Comparison</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  See how Facesheet360's innovative features compare to traditional EHR systems
                </p>
              </div>

              {comparisonFeatures.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.category)}
                    className="w-full"
                  >
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            {category.icon}
                          </div>
                          <CardTitle className="text-xl">{category.category}</CardTitle>
                          <Badge variant="secondary">
                            {category.features.length} features
                          </Badge>
                        </div>
                        {expandedCategory === category.category ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {expandedCategory === category.category && (
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                              <th className="text-center py-3 px-4 font-semibold text-blue-600">Facesheet360</th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-600">Traditional EHR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.features.map((feature, featureIndex) => (
                              <tr key={featureIndex} className="border-b hover:bg-gray-50">
                                <td className="py-4 px-4 text-gray-700">{feature.name}</td>
                                <td className="py-4 px-4 text-center">
                                  {feature.facesheet360 === true ? (
                                    <Check className="h-6 w-6 text-green-600 mx-auto" />
                                  ) : feature.facesheet360 === false ? (
                                    <X className="h-6 w-6 text-gray-300 mx-auto" />
                                  ) : (
                                    <Badge className="bg-blue-600">{feature.facesheet360}</Badge>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  {feature.traditional === true ? (
                                    <Check className="h-6 w-6 text-green-600 mx-auto" />
                                  ) : feature.traditional === false ? (
                                    <X className="h-6 w-6 text-gray-300 mx-auto" />
                                  ) : (
                                    <Badge variant="outline">{feature.traditional}</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}

              <div className="text-center mt-12">
                <Button size="lg" onClick={() => navigate('/view-plans')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  View Pricing & Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Pricing Comparison */}
            <TabsContent value="pricing" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Transparent Pricing Comparison</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  See how much you can save by switching to Facesheet360
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {pricingComparison.map((tier, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardTitle className="text-2xl">{tier.tier}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Facesheet360 */}
                        <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-blue-600">Facesheet360</h3>
                            <Badge className="bg-green-600">Recommended</Badge>
                          </div>
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-gray-900">{tier.facesheet360.price}</div>
                            <div className="text-sm text-gray-600">Annual: {tier.facesheet360.annual}</div>
                          </div>
                          <ul className="space-y-2">
                            {tier.facesheet360.features.map((feature, fIndex) => (
                              <li key={fIndex} className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Traditional EHR */}
                        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-600">Traditional EHR</h3>
                          </div>
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-gray-900">{tier.traditional.price}</div>
                            <div className="text-sm text-gray-600">Annual: {tier.traditional.annual}</div>
                          </div>
                          <ul className="space-y-2">
                            {tier.traditional.features.map((feature, fIndex) => (
                              <li key={fIndex} className="flex items-start gap-2">
                                <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Savings Highlight */}
                      {tier.tier !== 'Large Facility (20+ providers)' && (
                        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            Save up to 40-60% annually
                          </div>
                          <div className="text-sm text-gray-600">
                            Plus earn CareCoins worth $250+ per provider monthly
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Save on Your EHR Costs?</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Get a personalized quote and see exactly how much your facility can save
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button size="lg" onClick={() => navigate('/view-plans')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => navigate('/learn-more')}>
                        Request Custom Quote
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Migration Guide */}
            <TabsContent value="migration" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Your Migration Journey</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Step-by-step guide to seamlessly migrate from your current EHR to Facesheet360
                </p>
              </div>

              {/* Timeline Overview */}
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-2xl">Migration Timeline: 6-8 Weeks</CardTitle>
                  <CardDescription className="text-base">
                    Structured process with dedicated support at every step
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {migrationSteps.map((step, index) => (
                      <div key={index} className="relative">
                        {index !== migrationSteps.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-blue-200" />
                        )}
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold">
                              {step.step}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{step.title}</h3>
                              <Badge variant="outline">{step.duration}</Badge>
                            </div>
                            <p className="text-gray-600 mb-4">{step.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-700">{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Migration Support */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <Users className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle>Dedicated Migration Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Expert team guides you through every step with hands-on support and training
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle>Zero Data Loss Guarantee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Comprehensive validation at every step ensures 100% data integrity and accuracy
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <Clock className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Minimal Downtime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Parallel operation during transition means your practice never stops running
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Download Migration Guide */}
              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Download Complete Migration Guide</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Get our comprehensive 50-page migration guide with checklists, best practices, and success stories
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF Guide
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => navigate('/learn-more')}>
                        Schedule Migration Consultation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make the Switch?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Join hundreds of healthcare facilities that have already migrated to Facesheet360
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => navigate('/view-plans')}>
              Start Free 30-Day Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => navigate('/product-tour')}>
              Take Product Tour
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => navigate('/learn-more')}>
              Talk to Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Facesheet360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CompareEHR;
