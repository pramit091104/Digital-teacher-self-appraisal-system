
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../components/Header";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: "",
    department: "",
    designation: "",
    specialization: "",
    yearJoined: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", id));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            displayName: userData.displayName || "",
            email: userData.email || "",
            role: userData.role || "faculty",
            department: userData.department || "",
            designation: userData.designation || "",
            specialization: userData.specialization || "",
            yearJoined: userData.yearJoined || "",
          });
        } else {
          toast.error("User not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Error loading user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    setUpdating(true);
    
    try {
      await updateDoc(doc(db, "users", id), {
        displayName: formData.displayName,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        specialization: formData.specialization,
        yearJoined: formData.yearJoined,
      });
      
      toast.success("User updated successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto mt-8 p-4">
          <div className="text-center">Loading user data...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto mt-8 p-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <span>←</span> Back to Dashboard
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-2xl font-bold text-center">
                Edit User
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
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
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">Email cannot be changed</p>
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
                  
                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={updating}
                    >
                      {updating ? "Saving..." : "Save Changes"}
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

export default EditUser;
