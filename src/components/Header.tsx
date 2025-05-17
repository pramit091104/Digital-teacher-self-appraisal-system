
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">TeachnGrow</Link>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">
              {userData?.displayName || currentUser.email} 
              {userData?.role && ` (${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)})`}
            </span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-md text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
