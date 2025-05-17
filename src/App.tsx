
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminSignup from "./pages/AdminSignup"; // Add import for AdminSignup
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DocumentView from "./pages/DocumentView";
import DocumentEdit from "./pages/DocumentEdit";
import CategoryPage from "./pages/CategoryPage";
import AdminUsers from "./pages/AdminUsers";
import CreateEditUser from "./pages/CreateEditUser";
import ManageCriteria from "./pages/ManageCriteria";
import NotFound from "./pages/NotFound";
import AuthRoute from "./components/AuthRoute";
import Landing from "./pages/Landing";
import { setupMockAPI } from "./lib/mockData";
import { api } from "./lib/api";

function App() {
  // Initialize MongoDB connection and load documents when the component mounts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize documents from MongoDB with a timeout
        const initPromise = api.initDocuments();
        
        // Set a timeout to prevent hanging if MongoDB connection takes too long
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('MongoDB connection timeout - falling back to mock data'));
          }, 5000); // 5 second timeout
        });
        
        // Race between initialization and timeout
        await Promise.race([initPromise, timeoutPromise]);
        console.log('MongoDB connection initialized and documents loaded');
      } catch (error) {
        console.error('Error initializing MongoDB:', error);
        // Fallback to mock data if MongoDB initialization fails
        setupMockAPI();
        console.log('Fallback to mock API initialized with sample data');
      }
    };
    
    initializeApp();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<AdminSignup />} /> {/* Add route for AdminSignup */}
          
          <Route path="/dashboard" element={
            <AuthRoute>
              <Dashboard />
            </AuthRoute>
          } />
          <Route path="/profile" element={
            <AuthRoute>
              <Profile />
            </AuthRoute>
          } />
          <Route path="/category/:id" element={
            <AuthRoute>
              <CategoryPage />
            </AuthRoute>
          } />
          <Route path="/document/:id" element={
            <AuthRoute>
              <DocumentView />
            </AuthRoute>
          } />
          <Route path="/document/:id/edit" element={
            <AuthRoute>
              <DocumentEdit />
            </AuthRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <AuthRoute adminOnly>
              <AdminUsers />
            </AuthRoute>
          } />
          <Route path="/admin/users/:id" element={
            <AuthRoute adminOnly>
              <CreateEditUser />
            </AuthRoute>
          } />
          <Route path="/admin/create-user" element={
            <AuthRoute adminOnly>
              <CreateEditUser />
            </AuthRoute>
          } />
          <Route path="/admin/manage-criteria" element={
            <AuthRoute adminOnly>
              <ManageCriteria />
            </AuthRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
      
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
