
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const Profile = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: "",
    department: "",
    designation: "",
    specialization: "",
    yearJoined: "",
    email: "",
    phone: "",
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Populate form with existing data if available
    if (userData) {
      setFormData({
        displayName: userData.displayName || "",
        department: userData.department || "",
        designation: userData.designation || "",
        specialization: userData.specialization || "",
        yearJoined: userData.yearJoined || "",
        email: currentUser.email || "",
        phone: "",
      });
    }
  }, [currentUser, userData, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save user profile data to both MongoDB and Firestore
      if (currentUser) {
        const userId = currentUser.uid;
        console.log('Saving profile for user:', userId);
        
        // Create user data object to save
        const userDataToSave = {
          name: formData.displayName,
          displayName: formData.displayName, // For Firestore compatibility
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          specialization: formData.specialization,
          yearJoined: formData.yearJoined,
          phone: formData.phone,
          // Keep the existing role
          role: userData?.role || 'faculty'
        };
        
        try {
          // 1. Update user in MongoDB
          console.log('Saving to MongoDB...');
          await api.updateUser(userId, userDataToSave);
          console.log('Successfully saved to MongoDB');
        } catch (mongoError) {
          console.error('Error saving to MongoDB:', mongoError);
          // Continue with Firestore even if MongoDB fails
        }
        
        try {
          // 2. Update user in Firestore (which is what AuthContext uses)
          console.log('Saving to Firestore...');
          const userDocRef = doc(db, "users", userId);
          await setDoc(userDocRef, {
            ...userDataToSave,
            updatedAt: serverTimestamp()
          }, { merge: true });
          console.log('Successfully saved to Firestore');
        } catch (firestoreError) {
          console.error('Error saving to Firestore:', firestoreError);
          throw firestoreError; // Rethrow to trigger the error handler
        }
        
        // Refresh user data in the auth context to reflect changes immediately
        await refreshUserData();
        
        toast.success("Profile updated successfully");
        navigate("/dashboard");
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Header />
      
      <div className="container mx-auto mt-8 p-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
          
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="displayName" className="block mb-2 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="department" className="block mb-2 font-medium">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label htmlFor="designation" className="block mb-2 font-medium">
                    Designation
                  </label>
                  <select
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Designation</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="HOD">HOD</option>
                    <option value="Principal">Principal</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="specialization" className="block mb-2 font-medium">
                    Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label htmlFor="yearJoined" className="block mb-2 font-medium">
                    Year of Joining
                  </label>
                  <input
                    type="text"
                    id="yearJoined"
                    name="yearJoined"
                    value={formData.yearJoined}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 mb-4">
                <div>
                  <label htmlFor="phone" className="block mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-md"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
