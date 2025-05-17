import { api } from './apiService';

export interface Document {
  _id?: string;
  title: string;
  userId: string;
  userName: string;
  department?: string;
  designation?: string;
  category: string;
  categoryName: string;
  fields: Record<string, string>;
  status: 'draft' | 'pending' | 'approved' | 'revisable' | 'rejected';
  credits: number;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  revisionComment?: string;
  fileUrl?: string;
}

// Fetch all documents
export const fetchDocuments = async (filters?: Record<string, string>): Promise<Document[]> => {
  try {
    let queryString = '';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      queryString = `?${params.toString()}`;
    }

    const response = await api.get<Document[]>(`/documents${queryString}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Fetch document by ID
export const fetchDocumentById = async (documentId: string): Promise<Document | null> => {
  try {
    const response = await api.get<Document>(`/documents/${documentId}`);
    
    if (response.error) {
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    return null;
  }
};

// Create a new document
export const createDocument = async (documentData: Partial<Document>): Promise<Document | null> => {
  try {
    const response = await api.post<Document>('/documents', documentData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error creating document:', error);
    return null;
  }
};

// Update an existing document
export const updateDocument = async (documentId: string, documentData: Partial<Document>): Promise<Document | null> => {
  try {
    const response = await api.put<Document>(`/documents/${documentId}`, documentData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error updating document:', error);
    return null;
  }
};

// Review a document (for admin/reviewers)
export const reviewDocument = async (
  documentId: string, 
  status: 'approved' | 'revisable' | 'rejected', 
  revisionComment?: string
): Promise<Document | null> => {
  try {
    const response = await api.post<Document>(`/documents/${documentId}/review`, {
      status,
      revisionComment
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error reviewing document:', error);
    return null;
  }
};

// Delete a document
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const response = await api.delete<{message: string}>(`/documents/${documentId}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

// Get user credit summary
export const getUserCreditSummary = async (userId: string): Promise<Record<string, number>> => {
  try {
    const response = await api.get<Record<string, number>>(`/documents/user/${userId}/credits`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || {};
  } catch (error) {
    console.error('Error fetching user credit summary:', error);
    return {};
  }
};
