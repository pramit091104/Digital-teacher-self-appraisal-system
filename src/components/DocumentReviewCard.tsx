
import React, { useState } from "react";
import { Document } from "../lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DocumentReviewCardProps {
  document: Document;
  onApprove: (id: string) => Promise<void>;
  onRevise: (id: string, comment: string) => Promise<void>;
}

export const DocumentReviewCard = ({ 
  document, 
  onApprove, 
  onRevise 
}: DocumentReviewCardProps) => {
  const [revisionComment, setRevisionComment] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(document.id);
      toast.success("Document approved");
    } catch (error) {
      toast.error("Failed to approve document");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRevise = async () => {
    if (!revisionComment.trim()) {
      toast.error("Please add a revision comment");
      return;
    }
    
    setIsLoading(true);
    try {
      await onRevise(document.id, revisionComment);
      setShowRevisionForm(false);
      setRevisionComment("");
      toast.success("Document marked for revision");
    } catch (error) {
      toast.error("Failed to mark document for revision");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <h3 className="text-xl font-semibold">{document.title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p>{document.categoryName}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Submitted</p>
          <p>{new Date(document.submittedAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      {Object.entries(document.fields || {}).map(([key, value]) => (
        <div key={key} className="mb-2">
          <span className="font-medium mr-2">{key}:</span>
          <span>{value as string}</span>
        </div>
      ))}
      
      {document.fileUrl && (
        <div className="my-3">
          <a 
            href={document.fileUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            View Document
          </a>
        </div>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        {!showRevisionForm ? (
          <>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            
            <Button
              onClick={() => setShowRevisionForm(true)}
              disabled={isLoading}
              variant="secondary"
              className="bg-amber-500 hover:bg-amber-600"
            >
              Needs Revision
            </Button>
          </>
        ) : (
          <div className="w-full">
            <textarea
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Enter revision comments..."
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
              rows={3}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleRevise}
                disabled={isLoading}
                variant="secondary"
                className="bg-amber-500 hover:bg-amber-600"
              >
                Send for Revision
              </Button>
              
              <Button
                onClick={() => setShowRevisionForm(false)}
                disabled={isLoading}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
