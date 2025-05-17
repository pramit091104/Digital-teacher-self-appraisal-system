import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { UserList } from "../components/UserList";
import { User } from "../lib/api";
import { deleteUser, updateUserStatus, fetchUsers } from "../services/userService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { Plus } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userData } = useAuth();

  useEffect(() => {
    // Verify admin access
    if (userData && userData.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
      return;
    }
    
    // Fetch users
    loadUsers();
  }, [userData, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleSuspend = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const currentStatus = user.status || "active";
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const confirmMsg = `Are you sure you want to ${newStatus === "active" ? "activate" : "suspend"} this user?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await updateUserStatus(userId, newStatus as "active" | "suspended");
        
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus as "active" | "suspended" } : u
        ));
        
        toast.success(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      } catch (error) {
        console.error("Error updating user status:", error);
        toast.error(`Failed to ${newStatus === "active" ? "activate" : "suspend"} user`);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          
          <Button 
            onClick={() => navigate("/admin/create-user")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create New User
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <UserList 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSuspend={handleSuspend}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
