
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="py-6 px-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Facesheet360</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 gap-12">
        <div className="w-full max-w-md md:max-w-xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Modern Healthcare Management System</h2>
          <p className="text-lg text-gray-600 mb-8">
            Streamline patient care with our integrated platform for healthcare professionals.
            Secure, efficient, and designed for the modern medical workflow.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="default">Learn More</Button>
            <Button size="lg" variant="outline" className="border-2 border-primary/50">Request Demo</Button>
          </div>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      
      <footer className="py-6 px-8 border-t">
        <div className="container mx-auto text-center text-gray-500">
          &copy; {new Date().getFullYear()} Facesheet360. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
