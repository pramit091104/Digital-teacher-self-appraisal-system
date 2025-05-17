
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, AlertCircle, UserCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "../lib/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    message: "",
  });
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const { login, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (userData) {
      navigate("/dashboard");
      return;
    }

    // Get user type from location state
    const state = location.state as { userType?: string };
    if (state && state.userType) {
      setSelectedRole(state.userType);
    } else {
      // If no role is selected, redirect to landing page
      navigate("/landing");
    }
  }, [userData, navigate, location]);
  
  // Set page title
  useEffect(() => {
    document.title = `TeachnGrow - Login`;
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role selection
    if (!selectedRole) {
      toast.error("Please select your role before logging in");
      return;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    
    setLoading(true);

    try {
      // Convert selected role to UserRole type for login
      const roleValue = selectedRole as 'admin' | 'faculty' | 'hod' | 'principal';
      
      // Pass the selected role to the login function
      await login(email, password, rememberMe, roleValue);
      navigate("/dashboard");
      toast.success(`Welcome back!`);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message?.includes("suspended")) {
        toast.error("Your account has been suspended. Please contact an administrator.");
      } else if (error.message?.includes("don't have") || error.message?.includes("access")) {
        // Handle role mismatch error
        toast.error(error.message);
      } else if (error.code === "auth/user-not-found" || error.message?.includes("user-not-found")) {
        toast.error("No account found with this email. You may request an account if you're a new user.");
      } else {
        toast.error("Failed to log in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestForm.name || !requestForm.email || !requestForm.department || !requestForm.designation) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setRequestLoading(true);
    
    try {
      // Send credential request and email notification to admin
      const result = await authService.requestCredentials(
        requestForm.name,
        requestForm.email,
        selectedRole,
        requestForm.department
      );
      
      if (result.success) {
        toast.success("Account request submitted! An administrator will review your request and contact you via email.");
        // Reset form and close dialog
        setRequestForm({
          name: "",
          email: "",
          department: "",
          designation: "",
          message: "",
        });
        setRequestDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting credential request:", error);
      toast.error("An error occurred while submitting your request. Please try again later.");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">TeachnGrow</h1>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className={selectedRole === "admin" ? "bg-red-500" : selectedRole === "faculty" ? "bg-blue-500" : selectedRole === "hod" ? "bg-green-500" : selectedRole === "principal" ? "bg-yellow-500" : "bg-gray-500"}>
            <CardTitle className="text-2xl font-bold text-center">
              {selectedRole === "admin" ? "Admin Login" : 
                selectedRole === "faculty" ? "Faculty Login" : 
                selectedRole === "hod" ? "HOD Login" : 
                selectedRole === "principal" ? "Principal Login" : "Login"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="role" className="block mb-2 font-medium">
                  Select Your Role
                </label>
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger className="w-full" id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="hod">HOD</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!selectedRole && (
                <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Please select your role to continue
                </p>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2 font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="flex items-center mb-6">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)} 
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              
              <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/landing")}
                  className="w-full sm:w-auto flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Options
                </Button>
              </div>
            </form>
            
            {selectedRole !== "admin" && selectedRole !== "" && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-amber-600 mb-3">
                  <AlertCircle className="h-5 w-5" />
                  <p>Don't have an account?</p>
                </div>
                
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Request an Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Request a New Account</DialogTitle>
                      <DialogDescription>
                        Fill out this form to request an account. An administrator will review your request.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRequestSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={requestForm.name}
                            onChange={handleRequestChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={requestForm.email}
                            onChange={handleRequestChange}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            name="department"
                            value={requestForm.department}
                            onChange={handleRequestChange}
                            placeholder="Enter your department"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="designation">Designation</Label>
                          <Input
                            id="designation"
                            name="designation"
                            value={requestForm.designation}
                            onChange={handleRequestChange}
                            placeholder="e.g., Assistant Professor"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="message">Additional Information</Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={requestForm.message}
                            onChange={handleRequestChange}
                            placeholder="Any additional information..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={requestLoading}>
                          {requestLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Request"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
