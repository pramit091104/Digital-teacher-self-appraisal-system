
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Category, Document } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface DocumentFormProps {
  category: Category;
  initialValues?: Partial<Document>;
  isEditing?: boolean;
}

export const DocumentForm = ({ category, initialValues, isEditing = false }: DocumentFormProps) => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Document>>(
    initialValues || {
      title: "",
      category: category.id,
      userId: currentUser?.uid || "",
      userName: userData?.displayName || "",
      categoryName: category.name,
      status: "draft",
      credits: 0, // Will be calculated on server
      fields: {},
      submittedAt: new Date().toISOString(),
    }
  );
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("field_")) {
      const fieldName = name.replace("field_", "");
      setFormData(prev => ({
        ...prev,
        fields: {
          ...prev.fields,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent, asDraft: boolean) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Explicitly type the status as the union type that Document.status expects
      const status: "draft" | "pending" | "approved" | "revisable" | "rejected" = asDraft ? "draft" : "pending";
      
      const submissionData: Partial<Document> = {
        ...formData,
        status,
      };
      
      // In a real application, you would upload the file to Firebase Storage here
      // and then save the document with the file URL
      
      let result;
      if (isEditing && formData.id) {
        result = await api.updateDocument(formData.id, submissionData);
      } else {
        result = await api.createDocument(submissionData as Omit<Document, "id">);
      }
      
      toast.success(asDraft ? "Saved as draft" : "Submitted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
      
      <form>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        
        {category.fields?.map((field) => (
          <div className="mb-4" key={field}>
            <label className="block mb-2 font-medium">{field}</label>
            <input
              type="text"
              name={`field_${field}`}
              value={(formData.fields?.[field] as string) || ""}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
        ))}
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {formData.fileUrl && (
            <p className="mt-2 text-sm text-gray-600">
              Current file: 
              <a 
                href={formData.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-blue-600 hover:underline"
              >
                View file
              </a>
            </p>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
          >
            Save Draft
          </button>
          
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
