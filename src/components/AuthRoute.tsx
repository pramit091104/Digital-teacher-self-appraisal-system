
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface AuthRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  hodOnly?: boolean;
  facultyOnly?: boolean;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ 
  children, 
  adminOnly = false,
  hodOnly = false,
  facultyOnly = false
}) => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      // Not authenticated at all
      if (!currentUser) {
        toast.error("Please login to access this page");
        navigate("/login");
        return;
      }
      
      // Role-specific checks
      if (adminOnly && userData?.role !== "admin") {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }

      if (hodOnly && !["hod", "principal", "admin"].includes(userData?.role || "")) {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }

      if (facultyOnly && userData?.role !== "faculty") {
        toast.error("This page is only for faculty members");
        navigate("/dashboard");
        return;
      }
    }
  }, [currentUser, userData, loading, adminOnly, hodOnly, facultyOnly, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AuthRoute;
