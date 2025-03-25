
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, getUserById } from '@/lib/mongodb';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin';
  specialty?: string;
  licenseNumber?: string;
  profileImage?: string;
  careCoinsBalance: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  updateUserProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const authData = localStorage.getItem('healthcareAuth');
      
      if (authData) {
        try {
          const { userId, token } = JSON.parse(authData);
          
          // Validate the token and get user data
          const userData = await getUserById(userId);
          setUser(userData);
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('healthcareAuth');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { token, userId, user: userData } = await authenticateUser(email, password);
      
      // Store auth data in localStorage
      localStorage.setItem('healthcareAuth', JSON.stringify({ token, userId }));
      
      setUser(userData);
      sonnerToast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('healthcareAuth');
    setUser(null);
    sonnerToast.success('Logged out successfully');
    navigate('/login');
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
