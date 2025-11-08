import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, Lock } from 'lucide-react';
import { clerkAppearance } from '@/lib/clerk';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Heart className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Facesheet360</h1>
              <p className="text-muted-foreground">Secure, HIPAA-Compliant Healthcare Platform</p>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur border-muted">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">HIPAA Compliant</CardTitle>
              </div>
              <CardDescription>
                Your health data is encrypted and secured according to HIPAA standards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-muted">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Multiple Sign-in Options</CardTitle>
              </div>
              <CardDescription>
                Choose from email, phone, or social login options for convenient access
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• End-to-end encryption</p>
            <p>• Multi-factor authentication</p>
            <p>• Comprehensive audit logging</p>
            <p>• Role-based access control</p>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="flex justify-center">
                <SignIn
                  appearance={clerkAppearance}
                  redirectUrl="/dashboard"
                  signUpUrl="/login"
                />
              </TabsContent>

              <TabsContent value="signup" className="flex justify-center">
                <SignUp
                  appearance={clerkAppearance}
                  redirectUrl="/dashboard"
                  signInUrl="/login"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
