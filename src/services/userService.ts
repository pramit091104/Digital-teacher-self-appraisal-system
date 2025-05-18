
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

// Fetch all users from Firebase
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // First try to get users from Firebase
    const { db } = await import('../lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');
    
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    if (!querySnapshot.empty) {
      // Convert Firebase users to our User model
      const firebaseUsers: User[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Use Firebase UID as the user ID
          name: data.displayName || 'Unknown',
          email: data.email || '',
          role: data.role || 'faculty',
          department: data.department || '',
          designation: data.designation || '',
          specialization: data.specialization || '',
          yearJoined: data.yearJoined || '',
          status: data.status || 'active',
        };
      });
      
      return firebaseUsers;
    }
    
    // Fallback to MongoDB if Firebase fetch fails or returns empty
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

// Fetch user by email
export const fetchUserByEmail = async (email: string): Promise<User | null> => {
  try {
    // Query the API to find a user by email
    const response = await api.get<any>(`/users/email/${encodeURIComponent(email)}`);
    
    if (response.error || !response.data) {
      return null;
    }
    
    return convertApiResponseToUser(response.data);
  } catch (error) {
    console.error("Error fetching user by email:", error);
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

// Delete user from both Firebase and MongoDB
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Check if the userId is a Firebase UID or MongoDB ID
    let firebaseUid = userId;
    let mongoDbId = userId;
    let userEmail = '';
    
    // First try to get the user from Firebase directly using the ID
    const { db } = await import('../lib/firebase');
    const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Try to get the user document directly from Firebase
    const userDocRef = doc(db, 'users', firebaseUid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      // We found the user in Firebase
      const userData = userDocSnap.data();
      userEmail = userData.email || '';
      
      // Now we need to find the corresponding MongoDB ID
      try {
        // Query MongoDB to find the user with the same email
        const mongoUser = await fetchUserByEmail(userEmail);
        if (mongoUser) {
          mongoDbId = mongoUser.id;
        }
      } catch (mongoError) {
        console.warn("Could not find MongoDB user with email:", userEmail, mongoError);
        // Continue with deletion even if we can't find the MongoDB user
      }
    } else {
      // If not found directly in Firebase, try to get the user from MongoDB first
      try {
        const mongoUser = await fetchUserById(mongoDbId);
        if (mongoUser) {
          userEmail = mongoUser.email;
          
          // Now try to find the Firebase user with this email
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', userEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Get the Firebase UID from the first matching document
            firebaseUid = querySnapshot.docs[0].id;
          }
        }
      } catch (mongoError) {
        console.error("Error fetching MongoDB user:", mongoError);
        // Continue with deletion attempt
      }
    }
    
    // Delete from Firebase first
    try {
      const { deleteFirebaseUser } = await import('../contexts/AuthContext');
      
      // Delete the user from Firebase (both Firestore document and Auth if possible)
      await deleteFirebaseUser(firebaseUid);
      console.log(`Successfully processed Firebase deletion for user with UID: ${firebaseUid}`);
    } catch (firebaseError) {
      console.error("Error deleting user from Firebase:", firebaseError);
      // Continue with MongoDB deletion even if Firebase deletion fails
    }
    
    // Delete from MongoDB
    try {
      const response = await api.delete<any>(`/users/${mongoDbId}`);
      
      if (response.error) {
        console.error(`Error deleting user from MongoDB: ${response.error}`);
      } else {
        console.log(`Successfully deleted user from MongoDB with ID: ${mongoDbId}`);
      }
    } catch (mongoError) {
      console.error("Error deleting user from MongoDB:", mongoError);
      // If MongoDB deletion fails but Firebase deletion succeeded, we still consider it a success
    }
    
    // Return successfully as long as at least one deletion worked
  } catch (error) {
    console.error("Error in user deletion process:", error);
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
