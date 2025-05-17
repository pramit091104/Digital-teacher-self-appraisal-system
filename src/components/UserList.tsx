
import React, { useState } from "react";
import { User } from "../lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash, Ban, Check } from "lucide-react";

interface UserListProps {
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onSuspend: (id: string) => void;
}

export const UserList = ({ onEdit, onDelete, onSuspend }: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "faculty",
      department: "Computer Science",
      designation: "Assistant Professor",
      status: "active"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "faculty",
      department: "Electronics",
      designation: "Associate Professor",
      status: "active"
    },
    {
      id: "3",
      name: "Mohammed Ahmed",
      email: "m.ahmed@example.com",
      role: "hod",
      department: "Mechanical Engineering",
      designation: "Professor",
      status: "active"
    },
    {
      id: "4",
      name: "Lisa Wang",
      email: "lisa.wang@example.com",
      role: "faculty",
      department: "Mathematics",
      designation: "Assistant Professor",
      status: "suspended"
    },
    {
      id: "5",
      name: "Robert Chen",
      email: "r.chen@example.com",
      role: "admin",
      status: "active"
    }
  ]);
  
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by name, email or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </td>
                  <td className="py-3 px-4">{user.department || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(user)}
                        className="flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(user.id)}
                        className="flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                      <Button
                        size="sm"
                        variant={user.status === "active" ? "secondary" : "default"}
                        onClick={() => onSuspend(user.id)}
                        className="flex items-center"
                      >
                        {user.status === "active" ? (
                          <>
                            <Ban className="h-4 w-4 mr-1" /> Suspend
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
