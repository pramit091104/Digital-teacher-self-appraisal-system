
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserById, updateUser } from "../services/userService";
import { toast } from "sonner";

const CreateEditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData, signup } = useAuth();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "faculty",
    department: "",
    designation: "",
    specialization: "",
    yearJoined: "",
    password: "",
    confirmPassword: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(isEditMode);
  
  useEffect(() => {
    // Verify admin access
    if (userData?.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
      return;
    }
    
    // Fetch user data if in edit mode
    if (isEditMode && id) {
      fetchUser(id);
    }
  }, [userData, isEditMode, id, navigate]);
  
  const fetchUser = async (userId: string) => {
    try {
      setFetchingUser(true);
      const user = await fetchUserById(userId);
      
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "faculty",
          department: user.department || "",
          designation: user.designation || "",
          specialization: user.specialization || "",
          yearJoined: user.yearJoined || "",
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error("User not found");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setFetchingUser(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return false;
    }
    
    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isEditMode && id) {
        // Update existing user
        await updateUser(id, {
          name: formData.name,
          email: formData.email,
          role: formData.role as any,
          department: formData.department,
          designation: formData.designation,
          specialization: formData.specialization,
          yearJoined: formData.yearJoined
        });
        
        toast.success("User updated successfully");
      } else {
        // Create new user
        await signup(formData.email, formData.password, formData.name, formData.role as any);
        toast.success("User created successfully");
      }
      
      navigate("/admin/users");
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingUser) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4 mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Header />
      <div className="container mx-auto p-4 mt-8">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users")}
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            <span>←</span> Back to Users
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-2xl font-bold text-center">
                {isEditMode ? "Edit User" : "Create New User"}
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
                      disabled={isEditMode} // Can't change email in edit mode
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="yearJoined">Year Joined</Label>
                    <Input
                      id="yearJoined"
                      name="yearJoined"
                      value={formData.yearJoined}
                      onChange={handleChange}
                      placeholder="YYYY"
                    />
                  </div>
                  
                  {!isEditMode && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password (min. 6 characters)"
                          required={!isEditMode}
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
                          required={!isEditMode}
                        />
                      </div>
                    </>
                  )}
                  
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
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        isEditMode ? "Update User" : "Create User"
                      )}
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

export default CreateEditUser;
