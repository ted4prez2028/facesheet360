
import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/context/AuthContext";

export const useAuth = (): AuthContextType => {
  console.log('useAuth hook called from:', new Error().stack?.split('\n')[1]);
  
  const context = useContext(AuthContext);
  console.log('AuthContext value:', context);
  
  if (context === undefined) {
    console.error('useAuth called outside AuthProvider. Stack:', new Error().stack);
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
