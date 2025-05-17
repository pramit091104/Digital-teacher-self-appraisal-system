import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { api, Category, Document } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { DocumentPreview } from "../components/DocumentPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, FileText } from "lucide-react";

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      try {
        // Get category directly by ID for fresh data
        const category = await api.getCategory(id);
        if (!category) {
          throw new Error('Category not found');
        }
        
        // Get role-specific criteria if available
        const roleSpecificCriteria = category.roleSpecificCriteria?.[userData?.role || ""];
        
        // Use role-specific criteria if available, otherwise use default
        const maxCredits = roleSpecificCriteria?.maxCredits || category.maxCredits;
        const perDocumentCredits = roleSpecificCriteria?.perDocumentCredits || category.perDocumentCredits;
        
        setCategory({
          ...category,
          maxCredits,
          perDocumentCredits
        });
        
        // Initialize empty form values for each field
        const initialValues: Record<string, string> = {};
        category.fields.forEach(field => {
          initialValues[field] = "";
        });
        setFormValues(initialValues);
      } catch (error) {
        console.error("Error fetching category:", error);
        setError("Failed to load category data");
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch fresh data when component mounts
    fetchCategory();
    
    // Also fetch fresh data when user role changes
    return () => {
      // Cleanup any subscriptions if needed
    };
  }, [id, userData?.role]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewFile(selectedFile);
      // Don't automatically show preview when file is selected
    }
  };

  const handleViewDocument = () => {
    if (file) {
      // Ensure the preview file is set to the current file
      setPreviewFile(file);
      // Show the preview modal
      setShowPreview(true);
    }
  };
  
  const handleSubmit = async (asDraft: boolean) => {
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    
    // Validate required fields if not saving as draft
    if (!asDraft) {
      const missingFields = Object.entries(formValues)
        .filter(([_, value]) => !value.trim())
        .map(([field]) => field);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      if (!category || !currentUser) {
        throw new Error("Missing required data");
      }
      
      // Calculate credits based on user designation if applicable
      let creditValue = category.perDocumentCredits;
      if (userData?.designation && 
          category.roleSpecificCriteria && 
          category.roleSpecificCriteria[userData.designation]) {
        creditValue = category.roleSpecificCriteria[userData.designation].perDocumentCredits || creditValue;
      }
      
      const documentData: Omit<Document, "id"> = {
        title,
        category: category.id,
        categoryName: category.name,
        userId: currentUser.uid,
        userName: userData?.displayName || "Unknown User",
        department: userData?.department || "",
        designation: userData?.designation || "",
        credits: creditValue,
        status: asDraft ? "draft" : "pending",
        fields: formValues,
        submittedAt: new Date().toISOString()
      };
      
      // Upload the file and store its URL for document preview
      if (file) {
        try {
          // Create a temporary URL for the file that can be accessed by HODs
          const fileUrl = URL.createObjectURL(file);
          console.log("File uploaded and URL created:", fileUrl);
          
          // Store the file URL in the document data
          documentData.fileUrl = fileUrl;
          
          // In a real production app, you would upload this to cloud storage
          // and use a permanent URL instead of a temporary object URL
        } catch (fileError) {
          console.error("Error creating file URL:", fileError);
          toast.error("Failed to process the uploaded file");
        }
      }
      
      // Create the document first
      const result = await api.createDocument(documentData);
      
      // If not saving as draft, submit for review to ensure it appears in HOD panel
      if (!asDraft) {
        // Log for debugging
        console.log('Document submitted for review:', result.id);
        
        // Explicitly submit for review to ensure it's in the pending list
        await api.submitForReview(result.id);
        
        toast.success("Document submitted successfully and sent for review");
      } else {
        toast.success("Document saved as draft");
      }
      
      // Navigate to the document view
      navigate(`/document/${result.id}`);
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4 mt-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !category) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4 mt-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Category information could not be loaded"}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
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
            console.log('Closing preview');
            setShowPreview(false);
          }}
        />
      )}
      
      <div className="container mx-auto p-4 mt-8">
        <div className="mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline flex items-center"
          >
            &larr; Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
          <p className="text-gray-600 mb-6">{category.description}</p>
          
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <p className="font-medium">Credit Information</p>
            <p>This activity is worth {category.perDocumentCredits} credits per submission.</p>
            <p>Maximum credits allowed: {category.maxCredits}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit Document</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Title *</label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter a title for your document"
                  required
                />
              </div>
              
              {category.fields.map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{field} *</label>
                  {field.toLowerCase().includes('description') ? (
                    <Textarea
                      value={formValues[field] || ''}
                      onChange={e => handleInputChange(field, e.target.value)}
                      placeholder={`Enter ${field.toLowerCase()}`}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={formValues[field] || ''}
                      onChange={e => handleInputChange(field, e.target.value)}
                      placeholder={`Enter ${field.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document File
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {file && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewDocument}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFile(null);
                            setPreviewFile(null);
                            setShowPreview(false);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => handleSubmit(true)}
                  variant="outline"
                  disabled={submitting || !title.trim()}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !title.trim()}
                >
                  Submit for Approval
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPreview && previewFile && (
        <DocumentPreview
          file={previewFile}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CategoryPage;
