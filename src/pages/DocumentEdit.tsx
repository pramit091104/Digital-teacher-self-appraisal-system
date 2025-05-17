
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { DocumentForm } from "../components/DocumentForm";
import { DocumentPreview } from "../components/DocumentPreview";
import { api, Category, Document } from "../lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const DocumentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    const fetchDocumentAndCategory = async () => {
      if (!id) return;
      
      try {
        // In a real app, fetch the specific document by ID
        const documents = await api.getDocuments("");
        const foundDocument = documents.find((d) => d.id === id);
        
        if (foundDocument) {
          setDocument(foundDocument);
          
          // Fetch the category for this document
          const categories = await api.getCategories();
          const foundCategory = categories.find((c) => c.id === foundDocument.category);
          
          if (foundCategory) {
            setCategory(foundCategory);
          } else {
            setError("Category not found");
            toast.error("Category information not found");
          }
        } else {
          setError("Document not found");
          toast.error("Document not found");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Failed to load document");
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentAndCategory();
  }, [id]);
  
  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto mt-8 p-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error || !document || !category) {
    return (
      <div>
        <Header />
        <div className="container mx-auto mt-8 p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Document or category not found"}
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
  
  // Check if the document is in a state that can be edited
  if (document.status !== "draft" && document.status !== "revisable") {
    return (
      <div>
        <Header />
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Document</h1>
            
            {document?.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={() => handlePreviewDocument(document.fileUrl)}
                disabled={fetchingFile}
              >
                {fetchingFile ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full"></div>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Document
                  </span>
                )}
              </Button>
            )}
          </div>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            This document cannot be edited in its current state.
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(`/document/${id}`)}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              View Document
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
            setShowPreview(false);
            setPreviewFile(null);
          }}
        />
      )}
      
      <div className="container mx-auto mt-8 p-4">
        <div className="mb-4">
          <button
            onClick={() => navigate(`/document/${id}`)}
            className="text-primary hover:underline flex items-center"
          >
            &larr; Back to Document
          </button>
        </div>
        
        <DocumentForm 
          category={category} 
          initialValues={document} 
          isEditing={true} 
        />
      </div>
    </div>
  );
};

export default DocumentEdit;
