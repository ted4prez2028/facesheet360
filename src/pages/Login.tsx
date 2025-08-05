
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Github, Mail } from "lucide-react";
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  useSignIn, 
  useSignUp,
  useUser 
} from "@clerk/clerk-react";

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "doctor",
  });
  const { toast } = useToast();
  const { login, signUp, isAuthenticated, isLoading, authError } = useAuth();
  const navigate = useNavigate();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp: clerkSignUp } = useSignUp();
  const { isSignedIn, user: clerkUser } = useUser();

  useEffect(() => {
    console.log("Login page auth state:", { isAuthenticated, isLoading, authError });
    if (!isLoading && (isAuthenticated || isSignedIn)) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, authError, isSignedIn]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(loginData.email, loginData.password);
      console.log("Login successful, waiting for auth state to update");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      await signUp(
        registerData.email, 
        registerData.password, 
        {
          name: registerData.name,
          role: registerData.role,
        }
      );
      
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "doctor",
      });
      
      console.log("Registration successful, waiting for auth state to update");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    if (!signInLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}` as any,
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard"
      });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast({
        title: "Sign in failed",
        description: `Failed to sign in with ${provider}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading || !signInLoaded || !signUpLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-health-600" />
      </div>
    );
  }

  if (isAuthenticated || isSignedIn) {
    console.log("Already authenticated, redirecting to dashboard immediately");
    navigate('/dashboard', { replace: true });
    return null;
  }

  const socialProviders = [
    { name: 'Google', provider: 'google', icon: '🔍', color: 'bg-red-500 hover:bg-red-600' },
    { name: 'Facebook', provider: 'facebook', icon: '📘', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Twitter', provider: 'twitter', icon: '🐦', color: 'bg-sky-500 hover:bg-sky-600' },
    { name: 'LinkedIn', provider: 'linkedin_oidc', icon: '💼', color: 'bg-blue-700 hover:bg-blue-800' },
    { name: 'GitHub', provider: 'github', icon: <Github className="w-4 h-4" />, color: 'bg-gray-800 hover:bg-gray-900' },
    { name: 'Apple', provider: 'apple', icon: '🍎', color: 'bg-black hover:bg-gray-800' },
    { name: 'Microsoft', provider: 'microsoft', icon: '🪟', color: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Discord', provider: 'discord', icon: '🎮', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { name: 'Twitch', provider: 'twitch', icon: '📺', color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-health-50 to-health-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-health-900">Facesheet360</h1>
          <p className="text-health-600">Healthcare Management Platform</p>
        </div>
        
        <SignedOut>
          <Tabs defaultValue="login" className="w-full">
            {authError && (
              <div className="mb-4 text-center text-red-500">
                <p>Error: {authError}</p>
              </div>
            )}
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login" data-value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-health-200 shadow-lg">
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Choose your preferred sign-in method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Social Sign-In Options */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {socialProviders.map((provider) => (
                      <Button
                        key={provider.provider}
                        variant="outline"
                        size="sm"
                        className={`${provider.color} text-white border-0 flex items-center gap-2`}
                        onClick={() => handleSocialSignIn(provider.provider)}
                      >
                        {typeof provider.icon === 'string' ? (
                          <span className="text-sm">{provider.icon}</span>
                        ) : (
                          provider.icon
                        )}
                        <span className="text-xs">{provider.name}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="doctor@example.com"
                        required
                        value={loginData.email}
                        onChange={handleLoginChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-sm text-health-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={loginData.password}
                        onChange={handleLoginChange}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-health-600 hover:bg-health-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-health-200 shadow-lg">
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Join the HealthTrack platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Social Sign-Up Options */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {socialProviders.slice(0, 6).map((provider) => (
                      <Button
                        key={provider.provider}
                        variant="outline"
                        size="sm"
                        className={`${provider.color} text-white border-0 flex items-center gap-2`}
                        onClick={() => handleSocialSignIn(provider.provider)}
                      >
                        {typeof provider.icon === 'string' ? (
                          <span className="text-sm">{provider.icon}</span>
                        ) : (
                          provider.icon
                        )}
                        <span className="text-xs">{provider.name}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or register with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        name="name"
                        placeholder="Dr. Jane Smith"
                        required
                        value={registerData.name}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="doctor@example.com"
                        required
                        value={registerData.email}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        name="password"
                        type="password"
                        required
                        value={registerData.password}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                      <Input
                        id="reg-confirm-password"
                        name="confirmPassword"
                        type="password"
                        required
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-role">Role</Label>
                      <select
                        id="reg-role"
                        name="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={registerData.role}
                        onChange={handleRegisterChange}
                      >
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="therapist">Therapist</option>
                        <option value="cna">CNA</option>
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-health-600 hover:bg-health-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SignedOut>

        <SignedIn>
          <Card className="border-health-200 shadow-lg text-center">
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>You are signed in</CardDescription>
            </CardHeader>
            <CardContent>
              <UserButton afterSignOutUrl="/login" />
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="mt-4 w-full bg-health-600 hover:bg-health-700"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </SignedIn>
      </div>
    </div>
  );
};

export default Login;
