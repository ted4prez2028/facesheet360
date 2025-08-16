import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileImage,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WoundAssessment {
  id: string;
  patient_id: string;
  location: string;
  size: string;
  ai_analysis: AIAnalysis;
  stage: string;
  severity: string;
  healing_progress: string;
  infection_risk: string;
  recommendations: string[];
  treatment_plan: string;
  image_url?: string;
  assessed_at: string;
}

interface AIAnalysis {
  stage: string;
  severity: string;
  healingProgress: string;
  infectionRisk: string;
  recommendations: string[];
  treatmentPlan: string;
}

interface AIWoundAssessmentProps {
  patientId: string;
  onAssessmentComplete?: (assessment: WoundAssessment) => void;
}

export const AIWoundAssessment: React.FC<AIWoundAssessmentProps> = ({ 
  patientId, 
  onAssessmentComplete 
}) => {
  const [currentStep, setCurrentStep] = useState<'capture' | 'details' | 'analyzing' | 'results'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [woundLocation, setWoundLocation] = useState('');
  const [woundSize, setWoundSize] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WoundAssessment | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { user } = useAuth();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
        setCurrentStep('details');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        setCurrentStep('details');
      };
      reader.readAsDataURL(file);
    }
  };

  const performAIAnalysis = async () => {
    if (!capturedImage || !user) return;

    setIsAnalyzing(true);
    setCurrentStep('analyzing');

    try {
      // Convert data URL to base64
      const base64Image = capturedImage.split(',')[1];

      const { data, error } = await supabase.functions.invoke('analyze-wound-ai', {
        body: {
          imageBase64: base64Image,
          patientId,
          woundLocation,
          woundSize,
          additionalNotes
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      setCurrentStep('results');
      
      if (onAssessmentComplete) {
        onAssessmentComplete(data);
      }
      
      toast.success('AI wound analysis completed successfully');
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      toast.error('Failed to perform AI analysis');
      setCurrentStep('details');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAssessment = () => {
    setCapturedImage(null);
    setWoundLocation('');
    setWoundSize('');
    setAdditionalNotes('');
    setAnalysisResult(null);
    setCurrentStep('capture');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress?.toLowerCase()) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-yellow-600';
      case 'deteriorating': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-6 w-6 mr-2 text-blue-600" />
          AI-Powered Wound Assessment
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Progress 
            value={currentStep === 'capture' ? 25 : currentStep === 'details' ? 50 : currentStep === 'analyzing' ? 75 : 100} 
            className="flex-1" 
          />
          <span className="text-sm text-gray-600">
            Step {currentStep === 'capture' ? '1' : currentStep === 'details' ? '2' : currentStep === 'analyzing' ? '3' : '4'} of 4
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Image Capture */}
        {currentStep === 'capture' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Capture Wound Image</h3>
            
            {streamRef.current ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-lg mx-auto rounded-lg border"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center space-x-4">
                  <Button onClick={capturePhoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={startCamera} className="p-8">
                    <div className="flex flex-col items-center">
                      <Camera className="h-8 w-8 mb-2" />
                      <span>Use Camera</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 mb-2" />
                      <span>Upload Image</span>
                    </div>
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {capturedImage && (
              <div className="text-center">
                <img 
                  src={capturedImage} 
                  alt="Captured wound" 
                  className="max-w-lg mx-auto rounded-lg border"
                />
                <div className="mt-4 space-x-2">
                  <Button onClick={() => setCurrentStep('details')}>
                    Continue
                  </Button>
                  <Button variant="outline" onClick={() => setCapturedImage(null)}>
                    Retake
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Wound Details */}
        {currentStep === 'details' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wound Details</h3>
            
            {capturedImage && (
              <img 
                src={capturedImage} 
                alt="Wound to assess" 
                className="w-48 h-48 object-cover rounded-lg border mx-auto"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Wound Location</label>
                <Textarea
                  value={woundLocation}
                  onChange={(e) => setWoundLocation(e.target.value)}
                  placeholder="e.g., Left heel, sacral area, right ankle..."
                  className="h-20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Wound Size</label>
                <Textarea
                  value={woundSize}
                  onChange={(e) => setWoundSize(e.target.value)}
                  placeholder="e.g., 3cm x 2cm x 1cm deep..."
                  className="h-20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional observations, patient complaints, or relevant medical history..."
                className="h-24"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={performAIAnalysis} disabled={!woundLocation || !woundSize}>
                <Brain className="h-4 w-4 mr-2" />
                Analyze with AI
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep('capture')}>
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {currentStep === 'analyzing' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
            <p className="text-gray-600">
              Our AI is analyzing the wound image and generating recommendations...
            </p>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">⚡ Detecting wound characteristics...</div>
              <div className="text-sm text-gray-500">🔍 Assessing healing stage...</div>
              <div className="text-sm text-gray-500">📋 Generating treatment plan...</div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 'results' && analysisResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Analysis Results</h3>
              <Button onClick={resetAssessment} variant="outline">
                New Assessment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {capturedImage && (
                  <img 
                    src={capturedImage} 
                    alt="Analyzed wound" 
                    className="w-full rounded-lg border"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Wound Stage</label>
                    <Badge variant="outline" className="mt-1 block text-center">
                      {analysisResult.stage}
                    </Badge>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Severity</label>
                    <Badge className={`mt-1 block text-center ${getSeverityColor(analysisResult.severity)}`}>
                      {analysisResult.severity}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Healing Progress</label>
                  <div className={`mt-1 font-medium ${getProgressColor(analysisResult.healing_progress)}`}>
                    {analysisResult.healing_progress}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Infection Risk</label>
                  <div className="mt-1 flex items-center">
                    {analysisResult.infection_risk === 'High' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    ) : analysisResult.infection_risk === 'Low' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    <span>{analysisResult.infection_risk}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{analysisResult.treatment_plan}</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex space-x-2">
              <Button>
                <FileImage className="h-4 w-4 mr-2" />
                Save Assessment
              </Button>
              <Button variant="outline">
                Print Report
              </Button>
              <Button variant="outline">
                Share with Team
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};