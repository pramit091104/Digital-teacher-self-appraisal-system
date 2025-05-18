import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerField } from "@/components/DatePickerField";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

const CreateUser = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "faculty",
    department: "",
    designation: "",
    specialization: "",
    password: "",
    confirmPassword: ""
  });
  
  // Separate state for the date picker
  const [joinDate, setJoinDate] = useState<Date | undefined>(undefined);
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Format the join date if available
      const yearJoined = joinDate ? format(joinDate, "yyyy-MM-dd") : null;
      
      // Create a document in the users collection
      await setDoc(doc(db, "users", user.uid), {
        displayName: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department || null,
        designation: formData.designation || null,
        specialization: formData.specialization || null,
        yearJoined: yearJoined,
        status: "active",
        createdAt: serverTimestamp()
      });
      
      toast.success(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully`);
      
      // Reset the form instead of redirecting
      setFormData({
        name: "",
        email: "",
        role: "faculty",
        department: "",
        designation: "",
        specialization: "",
        password: "",
        confirmPassword: ""
      });
      setJoinDate(undefined);
      
      // No redirection - stay on the same page
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Try another email address.");
      } else {
        toast.error(`Failed to create user account: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto mt-8 p-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-2xl font-bold text-center">
                Create New User Account
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleSelectChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="hod">HOD</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Enter department"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Select
                      value={formData.designation}
                      onValueChange={(value) => handleSelectChange("designation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Enter specialization"
                    />
                  </div>
                  
                  <DatePickerField
                    label="Date Joined"
                    date={joinDate}
                    setDate={setJoinDate}
                    placeholder="Select join date"
                  />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password (min. 6 characters)"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/users")}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
