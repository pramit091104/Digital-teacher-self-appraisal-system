
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { CategoryCard } from "../components/CategoryCard";
import { useAuth } from "../contexts/AuthContext";
import { api, Category, Document } from "../lib/api";
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { toast } from "sonner";
import { deleteUser } from "firebase/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { getDummyCategories } from "../services/criteriaService";
import { ReviewerDashboard as ReviewerDashboardComponent } from "../components/ReviewerDashboard";
import { DocumentPreview } from "../components/DocumentPreview";
import { Eye, FileText, Edit } from "lucide-react";

// Faculty Dashboard Component
const FacultyDashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);
  const [maxCreditsByCategory, setMaxCreditsByCategory] = useState<Record<string, number>>({});
  const [totalMaxCredits, setTotalMaxCredits] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fetchingFile, setFetchingFile] = useState(false);
  
  const handlePreviewDocument = async (fileUrl: string) => {
    if (!fileUrl) return;
    
    setFetchingFile(true);
    
    try {
      // Fetch the file from the URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a File object from the blob
      const fileName = fileUrl.split('/').pop() || 'document';
      const fileType = blob.type || 'application/octet-stream';
      const file = new File([blob], fileName, { type: fileType });
      
      // Set the file for preview
      setPreviewFile(file);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching document for preview:', error);
      toast.error('Failed to load document preview');
    } finally {
      setFetchingFile(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch fresh categories from API
        const categoriesData = await api.getCategories();
        
        // Apply role-specific criteria if available
        const categoriesWithRoleCriteria = categoriesData.map(category => {
          const roleSpecificCriteria = category.roleSpecificCriteria?.[userData?.role || ""];
          return {
            ...category,
            maxCredits: roleSpecificCriteria?.maxCredits || category.maxCredits,
            perDocumentCredits: roleSpecificCriteria?.perDocumentCredits || category.perDocumentCredits
          };
        });
        
        setCategories(categoriesWithRoleCriteria);
        
        if (currentUser?.uid) {
          // Fetch documents
          try {
            const documentsData = await api.getDocuments(currentUser.uid);
            setDocuments(documentsData);
            
            // Calculate total credits achieved with role-specific criteria
            const totalAchieved = documentsData
              .filter(doc => doc.status === "approved")
              .reduce((sum, doc) => sum + doc.credits, 0);
            setTotalCredits(totalAchieved);
          } catch (error) {
            console.error("Error fetching documents", error);
            setDocuments([]);
          }
        }
        
        // Calculate max credits by category based on user's role/designation
        const maxByCategory: Record<string, number> = {};
        let maxCreditSum = 0;
        categoriesData.forEach(category => {
          let maxForCategory = category.maxCredits;
          
          if (userData?.designation && category.roleSpecificCriteria && 
              category.roleSpecificCriteria[userData.designation]) {
            maxForCategory = category.roleSpecificCriteria[userData.designation].maxCredits;
          }
          
          maxByCategory[category.id] = maxForCategory;
          maxCreditSum += maxForCategory;
        });
        
        setMaxCreditsByCategory(maxByCategory);
        setTotalMaxCredits(maxCreditSum);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser, userData, navigate]);
  
  // Calculate credits per category
  const creditsByCategory: Record<string, number> = {};
  documents
    .filter(doc => doc.status === "approved")
    .forEach(doc => {
      if (!creditsByCategory[doc.category]) {
        creditsByCategory[doc.category] = 0;
      }
      creditsByCategory[doc.category] += doc.credits;
    });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <Header />
      
      {showPreview && previewFile && (
        <DocumentPreview
          file={previewFile}
          onClose={() => {
            setShowPreview(false);
            setPreviewFile(null);
          }}
        />
      )}
      
      <div className="container mx-auto mt-8 p-4">
        {/* Profile Card */}
        <div className="bg-gray-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold">{userData?.displayName || "Faculty Member"}</h2>
                <div className="mt-2 space-y-1">
                  {userData?.department && (
                    <p className="text-gray-700">
                      <span className="font-medium">Department:</span> {userData.department}
                    </p>
                  )}
                  {userData?.designation && (
                    <p className="text-gray-700">
                      <span className="font-medium">Designation:</span> {userData.designation}
                    </p>
                  )}
                  {userData?.specialization && (
                    <p className="text-gray-700">
                      <span className="font-medium">Specialization:</span> {userData.specialization}
                    </p>
                  )}
                  {userData?.yearJoined && (
                    <p className="text-gray-700">
                      <span className="font-medium">Year Joined:</span> {userData.yearJoined}
                    </p>
                  )}
                  {currentUser?.email && (
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span> {currentUser.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate("/profile")}
              className="mt-4 md:mt-0 px-6 py-2 bg-gray-500 hover:bg-gray-600 rounded-md text-white"
            >
              Edit Profile
            </button>
          </div>
          
          {userData?.role === "faculty" && (
            <div className="mt-4">
              <div className="bg-gray-100 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full" 
                  style={{ width: `${Math.min((totalCredits / totalMaxCredits) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">
                Total Credits: <span className="font-medium">{totalCredits}</span> / <span className="font-medium">{totalMaxCredits}</span> required for appraisal
              </p>
            </div>
          )}
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryCredits = creditsByCategory[category.id] || 0;
            const maxCredits = maxCreditsByCategory[category.id] || category.maxCredits;
            
            // Icon name based on category name
            let iconName = "publication";
            if (category.name.toLowerCase().includes("academic") || category.name.toLowerCase().includes("achievement")) {
              iconName = "academic-achievements";
            } else if (category.name.toLowerCase().includes("event") || category.name.toLowerCase().includes("workshop")) {
              iconName = "event-partication";
            } else if (category.name.toLowerCase().includes("industry")) {
              iconName = "industry-contribution";
            } else if (category.name.toLowerCase().includes("student") || category.name.toLowerCase().includes("feedback")) {
              iconName = "student-feedbacks";
            }
            
            return (
              <div key={category.id} className="bg-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <h3 className="text-xl font-bold text-center">{category.name}</h3>
                </div>
                
                {userData?.role === "faculty" && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Progress</span>
                      <span>{categoryCredits} / {maxCredits} credits</span>
                    </div>
                    
                    <div className="bg-gray-300 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          categoryCredits >= maxCredits ? 'bg-green-600' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${Math.min((categoryCredits / maxCredits) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => navigate(`/category/${category.id}`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {documents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Your Submissions</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Title</th>
                    <th className="py-2 px-4 border-b text-left">Category</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Submitted</th>
                    <th className="py-2 px-4 border-b text-left">Credits</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{doc.title}</td>
                      <td className="py-2 px-4 border-b">{doc.category}</td>
                      <td className="py-2 px-4 border-b">
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.status === "approved" 
                              ? "bg-green-100 text-green-800" 
                              : doc.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : doc.status === "revisable" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b">{doc.credits}</td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/document/${doc.id}`)}
                            className="px-3 py-1 bg-accent hover:bg-accent/80 text-white rounded flex items-center"
                            title="View document details"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </button>
                          
                          {doc.fileUrl && (
                            <button
                              onClick={() => handlePreviewDocument(doc.fileUrl)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
                              disabled={fetchingFile}
                              title="Preview uploaded document"
                            >
                              {fetchingFile ? (
                                <span className="flex items-center">
                                  <div className="animate-spin h-3 w-3 mr-1 border-2 border-white border-t-transparent rounded-full"></div>
                                  Preview
                                </span>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </>
                              )}
                            </button>
                          )}
                          
                          {(doc.status === "draft" || doc.status === "revisable") && (
                            <button
                              onClick={() => navigate(`/document/${doc.id}/edit`)}
                              className="px-3 py-1 bg-primary hover:bg-primary/80 text-white rounded flex items-center"
                              title="Edit document"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get users from Firestore instead of API
        const usersCollection = await getDocs(collection(db, "users"));
        const usersData = usersCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().displayName || "Unknown",
          status: doc.data().status || "active"
        }));
        
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        // Delete from Firestore first
        await deleteDoc(doc(db, "users", userId));
        
        // Try to delete the Firebase auth user
        try {
          // This would typically require admin SDK or a Cloud Function
          // Here we're using the deleteAccount method we added
          await deleteAccount(userId);
        } catch (authError) {
          console.error("Error deleting auth user:", authError);
          // Not throwing here as we've already deleted from Firestore
        }
        
        // Update UI
        setUsers(users.filter(user => user.id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };
  
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      // Update user status in Firestore
      await updateDoc(doc(db, "users", userId), {
        status: newStatus
      });
      
      // Update UI
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
    } catch (error) {
      console.error(`Error ${newStatus === "active" ? "activating" : "suspending"} user:`, error);
      toast.error(`Failed to ${newStatus === "active" ? "activate" : "suspend"} user`);
    }
  };
  
  return (
    <div>
      <Header />
      
      <div className="container mx-auto mt-8 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          
          <div>
            <button 
              onClick={() => navigate("/admin/create-user")}
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md mr-2"
            >
              Create User
            </button>
            
            <button 
              onClick={() => navigate("/admin/manage-criteria")}
              className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-md"
            >
              Manage Criteria
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">User Management</h3>
          
          {loading ? (
            <p className="text-center py-4">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Email</th>
                    <th className="py-2 px-4 border-b text-left">Role</th>
                    <th className="py-2 px-4 border-b text-left">Department</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{user.name}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </td>
                        <td className="py-2 px-4 border-b">{user.department || "-"}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {user.status === "active" ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/admin/edit-user/${user.id}`)}
                              className="px-3 py-1 bg-accent hover:bg-accent/80 text-white rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1 bg-destructive hover:bg-destructive/80 text-white rounded"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              className={`px-3 py-1 ${
                                user.status === "active"
                                  ? "bg-warning hover:bg-warning/80" 
                                  : "bg-success hover:bg-success/80"
                              } text-white rounded`}
                            >
                              {user.status === "active" ? "Suspend" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HOD/Principal Dashboard Component - Rename this to avoid conflict
const ReviewerDashboardPage = () => {
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [approvedDocuments, setApprovedDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPending, setFilteredPending] = useState<Document[]>([]);
  const [filteredApproved, setFilteredApproved] = useState<Document[]>([]);
  const [searchBy, setSearchBy] = useState<'name' | 'department'>('name');
  
  // Function to fetch documents from API
  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents for HOD dashboard...');
      
      // Explicitly fetch pending documents from MongoDB
      const pending = await api.getDocumentsByStatus("pending");
      console.log('Pending documents from MongoDB:', pending);
      setPendingDocuments(pending || []);
      setFilteredPending(pending || []);
      
      // Explicitly fetch approved documents from MongoDB
      const approved = await api.getDocumentsByStatus("approved");
      console.log('Approved documents from MongoDB:', approved);
      setApprovedDocuments(approved || []);
      setFilteredApproved(approved || []);
      
      console.log(`Found ${pending?.length || 0} pending and ${approved?.length || 0} approved documents`);
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Initialize with empty arrays if there's an error
      setPendingDocuments([]);
      setFilteredPending([]);
      setApprovedDocuments([]);
      setFilteredApproved([]);
    }
  };
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    
    // Set up periodic refresh every 10 seconds to catch new submissions
    const refreshInterval = setInterval(() => {
      fetchDocuments();
    }, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);
  
  useEffect(() => {
    // Filter documents based on search query
    if (!searchQuery) {
      setFilteredPending(pendingDocuments);
      setFilteredApproved(approvedDocuments);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    
    setFilteredPending(pendingDocuments.filter(doc => {
      if (searchBy === 'name') {
        return doc.userName && doc.userName.toLowerCase().includes(lowerQuery);
      } else {
        return doc.department && doc.department.toLowerCase().includes(lowerQuery);
      }
    }));
    
    setFilteredApproved(approvedDocuments.filter(doc => {
      if (searchBy === 'name') {
        return doc.userName && doc.userName.toLowerCase().includes(lowerQuery);
      } else {
        return doc.department && doc.department.toLowerCase().includes(lowerQuery);
      }
    }));
  }, [searchQuery, searchBy, pendingDocuments, approvedDocuments]);
  
  const handleApprove = async (id: string) => {
    try {
      await api.reviewDocument(id, "approved");
      toast.success("Document approved successfully");
      
      // Update the local state to move the document from pending to approved
      const approvedDoc = pendingDocuments.find(doc => doc.id === id);
      if (approvedDoc) {
        // Ensure we're using the correct type for the status
        const updatedApprovedDoc: Document = { 
          ...approvedDoc, 
          status: "approved" as "draft" | "pending" | "approved" | "revisable" | "rejected" 
        };
        
        setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
        setApprovedDocuments(prev => [...prev, updatedApprovedDoc]);
        
        // Update filtered lists too
        setFilteredPending(prev => prev.filter(doc => doc.id !== id));
        setFilteredApproved(prev => [...prev, updatedApprovedDoc]);
      }
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error("Failed to approve document");
    }
  };
  
  const handleRevise = async (id: string, comment: string) => {
    try {
      await api.reviewDocument(id, "revisable", comment);
      toast.success("Document sent for revision");
      
      // Update the local state to remove the document from pending
      setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
      setFilteredPending(prev => prev.filter(doc => doc.id !== id)); 
    } catch (error) {
      console.error("Error marking document for revision:", error);
      toast.error("Failed to send document for revision");
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      toast.success("Document deleted successfully");
      
      // Update the local state to remove the document from both lists
      setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
      setApprovedDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Also update filtered lists
      setFilteredPending(prev => prev.filter(doc => doc.id !== id));
      setFilteredApproved(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Document Review Dashboard</h2>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-1">
            <input 
              type="text"
              placeholder="Search for..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-l-lg"
            />
            <button className="bg-gray-800 text-white px-6 py-3 rounded-r-lg">
              Search
            </button>
          </div>
          
          <div className="flex">
            <button
              onClick={() => setSearchBy('name')}
              className={`px-4 py-2 ${searchBy === 'name' ? 'bg-primary text-white' : 'bg-gray-200'} rounded-l-lg`}
            >
              Search by Name
            </button>
            <button
              onClick={() => setSearchBy('department')}
              className={`px-4 py-2 ${searchBy === 'department' ? 'bg-primary text-white' : 'bg-gray-200'} rounded-r-lg`}
            >
              Search by Department
            </button>
          </div>
        </div>
      </div>
      
      {/* Ensure we're passing valid documents to the component */}
      <ReviewerDashboardComponent 
        documents={[
          ...(Array.isArray(filteredPending) ? filteredPending : []), 
          ...(Array.isArray(filteredApproved) ? filteredApproved : [])
        ].filter(doc => doc && doc.id)}
        onApprove={handleApprove}
        onRevise={handleRevise}
        onDelete={handleDelete}
      />
    </div>
  );
};

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
  }, [currentUser, navigate]);
  
  if (!currentUser || !userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Return the appropriate dashboard based on user role
  if (userData.role === "admin") {
    return <AdminDashboard />;
  }
  
  if (userData.role === "hod" || userData.role === "principal") {
    return (
      <div>
        <Header />
        <div className="container mx-auto mt-8 p-4">
          <ReviewerDashboardPage />
        </div>
      </div>
    );
  }
  
  // Default to faculty dashboard
  return <FacultyDashboard />;
};

export default Dashboard;
