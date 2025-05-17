
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, UserCog, AlertCircle, LogIn } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleLogin = () => {
    if (!selectedRole) {
      alert("Please select your role first");
      return;
    }
    navigate("/login", { state: { userType: selectedRole } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">TeachnGrow</h1>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome to TeachnGrow</CardTitle>
              <p className="text-gray-600 mt-2">
                A comprehensive self-appraisal system for educational professionals
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Please select your role to continue</p>
                </div>
                <p className="text-amber-600 text-sm mt-1">
                  You must use credentials that match your selected role
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="block font-medium">
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
                    <SelectItem value="faculty">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Faculty</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hod">
                      <div className="flex items-center">
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>HOD</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="principal">
                      <div className="flex items-center">
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Principal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={!selectedRole}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Continue to Login
              </Button>
              
              {selectedRole === "admin" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/admin-signup")}
                >
                  Create Admin Account
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
