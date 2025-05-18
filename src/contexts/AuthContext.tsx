
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  deleteUser as firebaseDeleteUser,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";

export type UserRole = "admin" | "faculty" | "hod" | "principal";

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  designation?: string;
  specialization?: string;
  yearJoined?: string;
  status?: "active" | "suspended";
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  login: (email: string, password: string, rememberMe: boolean, selectedRole?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  deleteAccount: (userId: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Standalone function to delete a Firebase user by their UID
// This can be called from outside the AuthProvider context
export async function deleteFirebaseUser(firebaseUid: string): Promise<void> {
  try {
    // 1. Delete the user document from Firestore
    const userDocRef = doc(db, "users", firebaseUid);
    await deleteDoc(userDocRef);
    console.log(`Deleted Firestore document for user ${firebaseUid}`);
    
    // 2. For Firebase Auth deletion, we have limited options from client-side code:
    // Option A: If the user is the currently authenticated user, we can delete them
    // Option B: Otherwise, we need to disable their account in Firestore
    
    // Get the current user
    const { currentUser } = auth;
    
    if (currentUser && currentUser.uid === firebaseUid) {
      // If it's the current user, we can delete them directly
      try {
        await firebaseDeleteUser(currentUser);
        console.log(`Successfully deleted current user from Firebase Auth`);
      } catch (authError) {
        console.error("Error deleting current user from Firebase Auth:", authError);
      }
    } else {
      // For other users, we can't delete them directly from client-side code
      // Instead, mark them as disabled in Firestore
      try {
        await setDoc(doc(db, "users", firebaseUid), {
          status: "disabled",
          disabledAt: serverTimestamp(),
          // This flag indicates this user should be deleted from Auth
          // A Firebase Cloud Function could periodically check for this flag
          // and delete these users using the Admin SDK
          pendingAuthDeletion: true
        }, { merge: true });
        
        console.log(`Marked user ${firebaseUid} for deletion from Firebase Auth`);
      } catch (disableError) {
        console.error("Error marking user for deletion:", disableError);
      }
    }
  } catch (error) {
    console.error("Error deleting Firebase user:", error);
    throw error;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchUserData(user: FirebaseUser) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userDataFromFirestore = {
          uid: user.uid,
          email: user.email || "",
          displayName: userDoc.data().displayName || "",
          role: userDoc.data().role,
          department: userDoc.data().department,
          designation: userDoc.data().designation,
          specialization: userDoc.data().specialization,
          yearJoined: userDoc.data().yearJoined,
          status: userDoc.data().status || "active"
        };

        // Check if user is suspended
        if (userDataFromFirestore.status === "suspended") {
          // Sign out the user if they're suspended
          await signOut(auth);
          toast.error("Your account has been suspended. Please contact an administrator.");
          setUserData(null);
          return;
        }

        setUserData(userDataFromFirestore);
      } else {
        console.error("User document does not exist");
        // Create a basic user document if it doesn't exist
        // This helps prevent the 404 error
        if (user.email) {
          await setDoc(doc(db, "users", user.uid), {
            displayName: user.displayName || "User",
            email: user.email,
            role: "faculty", // Default role
            createdAt: serverTimestamp(),
            status: "active"
          });
          
          // Call fetchUserData again to get the newly created document
          await fetchUserData(user);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean, selectedRole?: UserRole) => {
    try {
      // Set persistence based on rememberMe flag
      // Note: In Firebase Web SDK v9, persistence is handled differently
      // We're not setting persistence here as it would require additional imports
      // Instead we'll rely on the default persistence which is local (browser session)
      
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is suspended by fetching their data
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Sign out if user document doesn't exist
        await signOut(auth);
        throw new Error("User account not found. Please contact an administrator.");
      }
      
      if (userDoc.data().status === "suspended") {
        // Sign out if suspended
        await signOut(auth);
        throw new Error("Your account has been suspended. Please contact an administrator.");
      }
      
      // Validate user role if a specific role was selected
      if (selectedRole && userDoc.data().role !== selectedRole) {
        // Sign out if role doesn't match
        await signOut(auth);
        throw new Error(`You don't have ${selectedRole} access. Please use the correct login option for your role.`);
      }

    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const deleteAccount = async (userId: string) => {
    try {
      // For admin-initiated deletion of other users
      // We need to use Firebase Admin SDK or a Cloud Function for this
      // For now, we'll just handle the Firestore document deletion
      if (currentUser && currentUser.uid === userId) {
        // If user is deleting their own account
        await firebaseDeleteUser(currentUser);
      }
      // Delete the user document from Firestore
      try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
      } catch (firestoreError) {
        console.error("Error deleting user document from Firestore:", firestoreError);
      }
      // Our server side or Cloud Functions would handle the actual deletion
      // of the Auth record for other users
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  // Fix the signup function to return a Promise<void> instead of Promise<UserCredential>
  const signup = async (email: string, password: string, name: string, role: UserRole = "faculty") => {
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, { displayName: name });
      
      // Create a user document in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: role,
        createdAt: serverTimestamp(),
        status: "active"
      });
      
      // Don't return userCredential, just return void to match the interface
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  };

  // Function to manually refresh user data from MongoDB/Firestore
  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  const value = {
    currentUser,
    userData,
    login,
    logout,
    loading,
    deleteAccount,
    signup,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
