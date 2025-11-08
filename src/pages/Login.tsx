import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new Clerk auth page
    navigate('/auth', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Login;
