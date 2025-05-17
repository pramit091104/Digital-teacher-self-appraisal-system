
import { User } from "../lib/api";
import { api } from "./apiService";

// Helper function to convert API response to User object
const convertApiResponseToUser = (data: any): User => {
  return {
    id: data._id,
    name: data.displayName || "Unknown",
    email: data.email || "",
    role: data.role || "faculty",
    department: data.department || "",
    designation: data.designation || "",
    specialization: data.specialization || "",
    yearJoined: data.yearJoined || "",
    status: data.status || "active",
  };
};

// Fetch all users from MongoDB
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<any[]>('/users');
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data?.map(convertApiResponseToUser) || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fetch users by department
export const fetchUsersByDepartment = async (department: string): Promise<User[]> => {
  try {
    const response = await api.get<any[]>(`/users?department=${encodeURIComponent(department)}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data?.map(convertApiResponseToUser) || [];
  } catch (error) {
    console.error("Error fetching users by department:", error);
    throw error;
  }
};

// Fetch user by ID
export const fetchUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await api.get<any>(`/users/${userId}`);
    
    if (response.error) {
      return null;
    }
    
    return convertApiResponseToUser(response.data);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

// Fetch users by role
export const fetchUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const response = await api.get<any[]>(`/users?role=${encodeURIComponent(role)}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data?.map(convertApiResponseToUser) || [];
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

// Update user status (active/suspended)
export const updateUserStatus = async (userId: string, status: 'active' | 'suspended'): Promise<void> => {
  try {
    const response = await api.put<any>(`/users/${userId}`, { status });
    
    if (response.error) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await api.delete<any>(`/users/${userId}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const response = await api.put<any>(`/users/${userId}`, userData);
    
    if (response.error) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Check if a user exists by email
export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await api.get<any[]>(`/users?email=${encodeURIComponent(email)}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return (response.data?.length || 0) > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};
