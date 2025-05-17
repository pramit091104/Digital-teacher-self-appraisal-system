import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { api, Document } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { DocumentStatus } from "../components/DocumentStatus";
import { DocumentPreview } from "../components/DocumentPreview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye } from "lucide-react";

const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revisionComment, setRevisionComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "revisable" | "rejected">("approved");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fetchingFile, setFetchingFile] = useState(false);
  
  const isReviewer = userData?.role === "admin" || userData?.role === "hod" || userData?.role === "principal";
  const canReview = isReviewer && document?.status === "pending";
  const canEdit = document && currentUser && document.userId === currentUser.uid && 
                 (document.status === "draft" || document.status === "revisable");
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        // Directly fetch the document by ID
        const foundDocument = await api.getDocument(id);
        
        if (foundDocument) {
          setDocument(foundDocument);
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
    
    fetchDocument();
  }, [id]);

  const handlePreviewDocument = async (fileUrl: string) => {
    if (!fileUrl) {
      toast.error('No document file available for preview');
      return;
    }
    
    setFetchingFile(true);
    
    try {
      // Check if it's a blob URL (created by URL.createObjectURL)
      if (fileUrl.startsWith('blob:')) {
        try {
          // Fetch the file from the blob URL
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
          
          // Convert the response to a blob
          const blob = await response.blob();
          
          // Create a File object from the blob
          const fileName = 'document';  // Blob URLs don't have filenames in the URL
          const fileType = blob.type || 'application/octet-stream';
          const file = new File([blob], fileName, { type: fileType });
          
          // Set the file for preview
          setPreviewFile(file);
          setShowPreview(true);
        } catch (blobError) {
          console.error('Error fetching document from blob URL:', blobError);
          toast.error('Failed to load document preview from temporary storage');
        }
      } else {
        // Handle regular URLs (e.g., from a storage service)
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
      }
    } catch (error) {
      console.error('Error fetching document for preview:', error);
      toast.error('Failed to load document preview');
    } finally {
      setFetchingFile(false);
    }
  };
  
  const handleReview = async () => {
    if ((reviewStatus === "revisable" || reviewStatus === "rejected") && !revisionComment.trim()) {
      toast.error("Please provide a comment for revision or rejection");
      return;
    }
    
    if (!document || !currentUser) return;
    
    setSubmittingReview(true);
    
    try {
      // Updated to match the API's expected parameters
      await api.reviewDocument(document.id, reviewStatus, revisionComment);
      
      toast.success(`Document has been ${reviewStatus === "approved" ? "approved" : 
                                         reviewStatus === "revisable" ? "sent back for revision" : 
                                         "rejected"}`);
      
      // Update the document status locally
      setDocument(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: reviewStatus,
          revisionComment: revisionComment,
          reviewedBy: currentUser.uid,
          reviewedAt: new Date().toISOString()
        };
      });
      
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error reviewing document:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
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
  
  if (error || !document) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4 mt-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Document not found"}
          </div>
          <div className="mt-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="default"
            >
              Back to Dashboard
            </Button>
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
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">{document?.title}</h1>
            {document && <DocumentStatus status={document.status} />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Document Details</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-600 w-1/3">Category</td>
                    <td className="py-2">{document?.categoryName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Submitted</td>
                    <td className="py-2">{document && new Date(document.submittedAt).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Credits</td>
                    <td className="py-2">{document?.credits}</td>
                  </tr>
                  {document?.reviewedAt && (
                    <tr>
                      <td className="py-2 text-gray-600">Reviewed</td>
                      <td className="py-2">{new Date(document.reviewedAt).toLocaleDateString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {document?.fileUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Attached Document</h3>
                <div className="flex space-x-3">
                  <a 
                    href={document.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Download Document
                  </a>
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
                        Preview Document
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Form Details</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form fields */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                {Object.entries(document.fields).map(([field, value]) => (
                  <div key={field}>
                    <h4 className="font-medium">{field}</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{value as string}</p>
                  </div>
                ))}
              </div>
              
              {/* Document preview */}
              {document?.fileUrl && (
                <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                  <h4 className="font-medium mb-3">Document Preview</h4>
                  <div className="flex mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center w-full"
                      onClick={() => handlePreviewDocument(document.fileUrl)}
                      disabled={fetchingFile}
                    >
                      {fetchingFile ? (
                        <span className="flex items-center justify-center w-full">
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full"></div>
                          Loading document...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Click to view document
                        </span>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    View the uploaded document alongside your form details.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {document?.revisionComment && (document?.status === "revisable" || document?.status === "rejected") && (
            <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Reviewer Comments</h3>
              <p className="text-gray-700">{document.revisionComment}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mt-6 border-t pt-4">
            {canEdit && (
              <Button 
                onClick={() => navigate(`/document/${id}/edit`)}
                variant="default"
              >
                Edit Document
              </Button>
            )}
            
            {canReview && !showReviewForm && (
              <Button 
                onClick={() => setShowReviewForm(true)}
                variant="secondary"
              >
                Review Document
              </Button>
            )}
          </div>
          
          {showReviewForm && canReview && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Review Document</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setReviewStatus("approved")}
                    variant={reviewStatus === "approved" ? "default" : "outline"}
                    className={reviewStatus === "approved" ? "" : "text-gray-700"}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => setReviewStatus("revisable")}
                    variant={reviewStatus === "revisable" ? "secondary" : "outline"}
                    className={reviewStatus === "revisable" ? "" : "text-gray-700"}
                  >
                    Request Revision
                  </Button>
                  <Button
                    onClick={() => setReviewStatus("rejected")}
                    variant={reviewStatus === "rejected" ? "destructive" : "outline"}
                    className={reviewStatus === "rejected" ? "" : "text-gray-700"}
                  >
                    Reject
                  </Button>
                </div>
                
                {(reviewStatus === "revisable" || reviewStatus === "rejected") && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {reviewStatus === "revisable" ? "Revision Instructions" : "Rejection Reason"} *
                    </label>
                    <Textarea
                      value={revisionComment}
                      onChange={e => setRevisionComment(e.target.value)}
                      placeholder={reviewStatus === "revisable" ? 
                        "Provide specific instructions for revision" : 
                        "Provide reason for rejection"}
                      rows={3}
                      required
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleReview}
                    disabled={submittingReview || ((reviewStatus === "revisable" || reviewStatus === "rejected") && !revisionComment.trim())}
                  >
                    Submit Review
                  </Button>
                  <Button
                    onClick={() => setShowReviewForm(false)}
                    variant="outline"
                    disabled={submittingReview}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
