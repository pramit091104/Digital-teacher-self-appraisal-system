// API and type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  specialization?: string;
  yearJoined?: string;
  status?: "active" | "suspended";
}

export interface Category {
  id: string;
  name: string;
  description: string;
  maxCredits: number;
  perDocumentCredits: number;
  fields: string[];
  roleSpecificCriteria?: Record<string, { maxCredits: number; perDocumentCredits: number }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Document {
  id: string;
  title: string;
  userId: string;
  userName: string;
  department?: string;
  designation?: string;
  category: string;
  categoryName: string;
  fields: Record<string, any>;
  status: 'draft' | 'pending' | 'approved' | 'revisable' | 'rejected';
  credits: number;
  submittedAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  revisionComment?: string;
  fileUrl?: string;
}

import { connectToDatabase, UserModel, CategoryModel, DocumentModel } from './mongodb';
import { emailService } from './emailService';

// Initialize MongoDB connection
connectToDatabase().catch(error => {
  console.error('Failed to connect to MongoDB:', error);
});

// Helper function to load documents from MongoDB
const loadDocumentsFromDB = async (): Promise<Document[]> => {
  try {
    const documents = await DocumentModel.find({}).lean();
    return documents.map(doc => {
      const docData = doc as any;
      return {
        id: docData.id || docData._id.toString(),
        title: docData.title || '',
        userId: docData.userId || '',
        userName: docData.userName || '',
        department: docData.department || '',
        designation: docData.designation || '',
        category: docData.category || '',
        categoryName: docData.categoryName || '',
        fields: docData.fields || {},
        status: docData.status || 'draft',
        credits: docData.credits || 0,
        submittedAt: docData.submittedAt?.toISOString() || new Date().toISOString(),
        updatedAt: docData.updatedAt?.toISOString(),
        reviewedBy: docData.reviewedBy,
        reviewedAt: docData.reviewedAt?.toISOString(),
        revisionComment: docData.revisionComment,
        fileUrl: docData.fileUrl
      } as Document;
    });
  } catch (error) {
    console.error('Error loading documents from MongoDB:', error);
    // Fallback to localStorage if MongoDB fails
    try {
      const storedDocs = localStorage.getItem('documents');
      return storedDocs ? JSON.parse(storedDocs) : [];
    } catch (storageError) {
      console.error('Error loading from localStorage fallback:', storageError);
      return [];
    }
  }
};

// Helper function to save a document to MongoDB
const saveDocumentToDB = async (document: Document): Promise<void> => {
  try {
    await DocumentModel.findOneAndUpdate(
      { id: document.id },
      document,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving document to MongoDB:', error);
    // Fallback to localStorage
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const index = documents.findIndex((d: Document) => d.id === document.id);
      if (index >= 0) {
        documents[index] = document;
      } else {
        documents.push(document);
      }
      localStorage.setItem('documents', JSON.stringify(documents));
    } catch (storageError) {
      console.error('Error saving to localStorage fallback:', storageError);
    }
  }
};

// Helper function to delete a document from MongoDB
const deleteDocumentFromDB = async (id: string): Promise<void> => {
  try {
    await DocumentModel.deleteOne({ id });
  } catch (error) {
    console.error('Error deleting document from MongoDB:', error);
    // Fallback to localStorage
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const updatedDocs = documents.filter((d: Document) => d.id !== id);
      localStorage.setItem('documents', JSON.stringify(updatedDocs));
    } catch (storageError) {
      console.error('Error deleting from localStorage fallback:', storageError);
    }
  }
};

export const api = {
  // User-related functions
  getUsers: async (): Promise<User[]> => {
    try {
      const users = await UserModel.find({}).lean();
      return users.map(user => ({
        id: user.id || user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        specialization: user.specialization,
        yearJoined: user.yearJoined,
        status: user.status
      }));
    } catch (error) {
      console.error('Error fetching users from MongoDB:', error);
      throw new Error('Failed to fetch users');
    }
  },

  // Category-related functions
  getCategories: async (): Promise<Category[]> => {
    // Default categories as fallback
    const defaultCategories: Category[] = [
      {
        id: '1',
        name: 'Publications',
        description: 'Research papers, journal articles, and books',
        maxCredits: 20,
        perDocumentCredits: 5,
        fields: ['Publication Type', 'Title', 'Journal/Conference', 'Date', 'DOI/URL'],
        roleSpecificCriteria: {
          "Professor": { maxCredits: 25, perDocumentCredits: 6 },
          "Associate Professor": { maxCredits: 22, perDocumentCredits: 5 }
        }
      },
      {
        id: '2',
        name: 'Industry Contributions',
        description: 'Consultations, projects, and collaborations',
        maxCredits: 15,
        perDocumentCredits: 3,
        fields: ['Contribution Type', 'Company/Organization', 'Role', 'Duration', 'Outcome']
      }
    ];
    
    try {
      // Check if MongoDB is available and CategoryModel is properly initialized
      if (!CategoryModel || typeof CategoryModel.find !== 'function') {
        console.warn('CategoryModel.find is not available, using default categories');
        return defaultCategories;
      }
      
      // Try to fetch categories from MongoDB
      const categories = await CategoryModel.find({}).lean();
      if (categories && categories.length > 0) {
        return categories.map(cat => {
          const catData = cat as any;
          return {
            id: catData.id || catData._id.toString(),
            name: catData.name,
            description: catData.description || '',
            maxCredits: catData.maxCredits || 0,
            perDocumentCredits: catData.perDocumentCredits || 0,
            fields: catData.fields || [],
            roleSpecificCriteria: catData.roleSpecificCriteria || {},
            createdAt: catData.createdAt,
            updatedAt: catData.updatedAt
          } as Category;
        });
      }
      
      // If no categories found in MongoDB, return default categories
      return defaultCategories;
    } catch (error) {
      console.error('Error fetching categories from MongoDB:', error);
      // Return default categories if there's an error
      return defaultCategories;
    }


  },

  getCategory: async (id: string): Promise<Category | null> => {
    try {
      // Check if MongoDB is available and CategoryModel is properly initialized
      if (!CategoryModel || typeof CategoryModel.findOne !== 'function') {
        console.warn('CategoryModel.findOne is not available, using getCategories fallback');
        // Fallback to searching in default categories
        const categories = await api.getCategories();
        return categories.find(c => c.id === id) || null;
      }
      
      const category = await CategoryModel.findOne({ id }).lean();
      if (category) {
        return {
          id: category.id || category._id.toString(),
          name: category.name,
          description: category.description || '',
          maxCredits: category.maxCredits || 0,
          perDocumentCredits: category.perDocumentCredits || 0,
          fields: category.fields || [],
          roleSpecificCriteria: category.roleSpecificCriteria
        };
      }
    } catch (error) {
      console.error(`Error fetching category ${id} from MongoDB:`, error);
    }
    
    // Fallback to searching in default categories
    const categories = await api.getCategories();
    return categories.find(c => c.id === id) || null;
  },

  // Document-related functions
  documents: [] as Document[],
  
  // Initialize documents from MongoDB when the app starts
  initDocuments: async () => {
    api.documents = await loadDocumentsFromDB();
  },

  getDocuments: async (userId: string): Promise<Document[]> => {
    try {
      // If userId is empty, return all documents (for admin views)
      // Otherwise filter documents by user ID
      let query = {};
      if (userId) {
        query = { userId };
      }
      
      const documents = await DocumentModel.find(query).lean();
      return documents.map(doc => {
        const docData = doc as any;
        return {
          id: docData.id || docData._id.toString(),
          title: docData.title || '',
          userId: docData.userId || '',
          userName: docData.userName || '',
          department: docData.department || '',
          designation: docData.designation || '',
          category: docData.category || '',
          categoryName: docData.categoryName || '',
          fields: docData.fields || {},
          status: docData.status || 'draft',
          credits: docData.credits || 0,
          submittedAt: docData.submittedAt?.toISOString() || new Date().toISOString(),
          updatedAt: docData.updatedAt?.toISOString(),
          reviewedBy: docData.reviewedBy,
          reviewedAt: docData.reviewedAt?.toISOString(),
          revisionComment: docData.revisionComment,
          fileUrl: docData.fileUrl
        } as Document;
      });
    } catch (error) {
      console.error('Error fetching documents from MongoDB:', error);
      // Fallback to in-memory documents if MongoDB fails
      if (!userId) {
        return api.documents;
      }
      return api.documents.filter(doc => doc.userId === userId);
    }
  },

  getDocument: async (id: string): Promise<Document | null> => {
    try {
      // Find document by ID in MongoDB
      const doc = await DocumentModel.findOne({ id }).lean();
      if (doc) {
        const docData = doc as any;
        return {
          id: docData.id || docData._id.toString(),
          title: docData.title || '',
          userId: docData.userId || '',
          userName: docData.userName || '',
          department: docData.department || '',
          designation: docData.designation || '',
          category: docData.category || '',
          categoryName: docData.categoryName || '',
          fields: docData.fields || {},
          status: docData.status || 'draft',
          credits: docData.credits || 0,
          submittedAt: docData.submittedAt?.toISOString() || new Date().toISOString(),
          updatedAt: docData.updatedAt?.toISOString(),
          reviewedBy: docData.reviewedBy,
          reviewedAt: docData.reviewedAt?.toISOString(),
          revisionComment: docData.revisionComment,
          fileUrl: docData.fileUrl
        } as Document;
      }
    } catch (error) {
      console.error(`Error fetching document ${id} from MongoDB:`, error);
    }
    
    // Fallback to in-memory documents if MongoDB fails
    const document = api.documents.find(doc => doc.id === id);
    if (!document) {
      console.error(`Document with ID ${id} not found`);
    }
    return document || null;
  },

  createDocument: async (documentData: Partial<Document>): Promise<Document> => {
    // Generate a unique ID using Date.now() and a counter
    const id = 'doc' + Date.now().toString();
    const newDoc: Document = {
      id,
      title: documentData.title || '',
      userId: documentData.userId || '',
      userName: documentData.userName || '',
      department: documentData.department || '',
      designation: documentData.designation || '',
      category: documentData.category || '',
      categoryName: documentData.categoryName || '',
      fields: documentData.fields || {},
      status: documentData.status || 'draft',
      credits: documentData.credits || 0,
      submittedAt: new Date().toISOString(),
      ...documentData
    };

    try {
      // Save to MongoDB
      await DocumentModel.create(newDoc);
      console.log('Document created and saved to MongoDB:', newDoc.id);
    } catch (error) {
      console.error('Error saving document to MongoDB:', error);
      // Fallback to localStorage if MongoDB fails
      try {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        documents.push(newDoc);
        localStorage.setItem('documents', JSON.stringify(documents));
      } catch (storageError) {
        console.error('Error saving to localStorage fallback:', storageError);
      }
    }
    
    // Add to in-memory documents array
    api.documents.push(newDoc);
    
    // Return the created document
    return newDoc;
  },

  updateDocument: async (id: string, documentData: Partial<Document>): Promise<Document> => {
    try {
      // First try to update in MongoDB
      const updatedData = {
        ...documentData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await DocumentModel.findOneAndUpdate(
        { id },
        { $set: updatedData },
        { new: true, runValidators: true }
      ).lean();
      
      if (result) {
        console.log('Document updated in MongoDB:', id);
        const docData = result as any;
        const updatedDoc: Document = {
          id: docData.id || docData._id.toString(),
          title: docData.title || '',
          userId: docData.userId || '',
          userName: docData.userName || '',
          department: docData.department || '',
          designation: docData.designation || '',
          category: docData.category || '',
          categoryName: docData.categoryName || '',
          fields: docData.fields || {},
          status: docData.status || 'draft',
          credits: docData.credits || 0,
          submittedAt: docData.submittedAt?.toISOString() || new Date().toISOString(),
          updatedAt: docData.updatedAt?.toISOString(),
          reviewedBy: docData.reviewedBy,
          reviewedAt: docData.reviewedAt?.toISOString(),
          revisionComment: docData.revisionComment,
          fileUrl: docData.fileUrl
        };
        
        // Update in-memory cache
        const docIndex = api.documents.findIndex(doc => doc.id === id);
        if (docIndex !== -1) {
          api.documents[docIndex] = updatedDoc;
        }
        
        return updatedDoc;
      }
    } catch (error) {
      console.error('Error updating document in MongoDB:', error);
    }
    
    // Fallback to in-memory update if MongoDB fails
    const docIndex = api.documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) {
      throw new Error('Document not found');
    }

    const updatedDoc = {
      ...api.documents[docIndex],
      ...documentData,
      updatedAt: new Date().toISOString()
    };

    api.documents[docIndex] = updatedDoc;
    
    // Fallback to localStorage
    try {
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const index = documents.findIndex((d: Document) => d.id === id);
      if (index >= 0) {
        documents[index] = updatedDoc;
        localStorage.setItem('documents', JSON.stringify(documents));
      }
    } catch (storageError) {
      console.error('Error updating in localStorage fallback:', storageError);
    }
    
    return updatedDoc;
  },

  submitForReview: async (id: string): Promise<Document> => {
    // First check if document exists
    const doc = await api.getDocument(id);
    if (!doc) {
      throw new Error('Document not found');
    }

    console.log('Document submitted for review in MongoDB:', id);
    // Use updateDocument which now updates MongoDB
    const updatedDoc = await api.updateDocument(id, {
      status: 'pending'
    });
    
    try {
      // Get faculty department from document
      const facultyDepartment = doc.department || '';
      
      // Try to find HOD in MongoDB first (to ensure we use login email)
      const hodData = await UserModel.find({ role: 'hod' }).lean();
      let departmentHOD = null;
      
      if (hodData && hodData.length > 0) {
        // Find HOD for the faculty's department from MongoDB
        departmentHOD = hodData.find(hod => hod.department === facultyDepartment);
      }
      
      // If not found in MongoDB, try Firestore
      if (!departmentHOD || !departmentHOD.email) {
        // Fallback to Firestore users
        const users = await api.getUsers();
        const hods = users.filter(user => user.role === 'hod');
        
        // Find HOD for the faculty's department
        departmentHOD = hods.find(hod => hod.department === facultyDepartment);
      }
      
      if (departmentHOD && departmentHOD.email) {
        // Send email notification to HOD
        await emailService.notifyNewDocumentSubmitted(
          departmentHOD.name || 'Department Head',
          doc.userName,
          doc.title,
          departmentHOD.email
        );
        console.log(`Email notification sent to HOD: ${departmentHOD.email}`);
      } else {
        console.log(`No HOD found for department: ${facultyDepartment}`);
      }
    } catch (emailError) {
      console.error('Error sending email notification to HOD:', emailError);
      // Continue with the function even if email fails
    }
    
    return updatedDoc;
  },

  reviewDocument: async (id: string, decision: 'approved' | 'revisable' | 'rejected', comment?: string): Promise<Document> => {
    // First check if document exists
    const doc = await api.getDocument(id);
    if (!doc) {
      throw new Error('Document not found');
    }

    console.log(`Document reviewed with decision: ${decision} in MongoDB:`, id);
    // Use updateDocument which now updates MongoDB
    const updatedDoc = await api.updateDocument(id, {
      status: decision,
      revisionComment: comment,
      reviewedAt: new Date().toISOString()
    });
    
    try {
      // Get faculty data from MongoDB to ensure we have the correct email
      const facultyData = await UserModel.findOne({ id: doc.userId }).lean();
      
      // If MongoDB lookup fails, try to get from Firestore
      if (!facultyData || !facultyData.email) {
        // Fallback to Firestore users collection
        const users = await api.getUsers();
        const faculty = users.find(user => user.id === doc.userId);
        
        if (faculty && faculty.email) {
          // Send appropriate email notification based on decision
          switch (decision) {
            case 'approved':
              await emailService.notifyDocumentApproved(
                faculty.name,
                doc.title,
                faculty.email
              );
              console.log(`Approval email sent to faculty: ${faculty.email}`);
              break;
            
            case 'revisable':
              await emailService.notifyDocumentRevisable(
                faculty.name,
                doc.title,
                comment || 'Please review and make necessary changes.',
                faculty.email
              );
              console.log(`Revision email sent to faculty: ${faculty.email}`);
              break;
            
            case 'rejected':
              await emailService.notifyDocumentRejected(
                faculty.name,
                doc.title,
                comment || 'Document does not meet the required criteria.',
                faculty.email
              );
              console.log(`Rejection email sent to faculty: ${faculty.email}`);
              break;
          }
        }
      } else {
        // Use the email from MongoDB
        const facultyEmail = facultyData.email;
        const facultyName = facultyData.name || doc.userName;
        
        // Send appropriate email notification based on decision
        switch (decision) {
          case 'approved':
            await emailService.notifyDocumentApproved(
              facultyName,
              doc.title,
              facultyEmail
            );
            console.log(`Approval email sent to faculty: ${facultyEmail}`);
            break;
          
          case 'revisable':
            await emailService.notifyDocumentRevisable(
              facultyName,
              doc.title,
              comment || 'Please review and make necessary changes.',
              facultyEmail
            );
            console.log(`Revision email sent to faculty: ${facultyEmail}`);
            break;
          
          case 'rejected':
            await emailService.notifyDocumentRejected(
              facultyName,
              doc.title,
              comment || 'Document does not meet the required criteria.',
              facultyEmail
            );
            console.log(`Rejection email sent to faculty: ${facultyEmail}`);
            break;
        }
      }
    } catch (emailError) {
      console.error('Error sending email notification to faculty:', emailError);
      // Continue with the function even if email fails
    }
    
    return updatedDoc;
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      // Try to delete from MongoDB first
      await DocumentModel.deleteOne({ id });
      console.log(`Document ${id} deleted from MongoDB`);
      
      // Also remove from in-memory cache
      const docIndex = api.documents.findIndex(doc => doc.id === id);
      if (docIndex !== -1) {
        api.documents.splice(docIndex, 1);
      }
    } catch (error) {
      console.error('Error deleting document from MongoDB:', error);
      
      // Fallback to in-memory deletion if MongoDB fails
      const docIndex = api.documents.findIndex(doc => doc.id === id);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      api.documents.splice(docIndex, 1);
      
      // Fallback to localStorage
      try {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const updatedDocs = documents.filter((d: Document) => d.id !== id);
        localStorage.setItem('documents', JSON.stringify(updatedDocs));
      } catch (storageError) {
        console.error('Error updating localStorage fallback:', storageError);
      }
    }
  },

  // Get documents by status (for HOD/reviewer dashboards)
  getDocumentsByStatus: async (status: 'draft' | 'pending' | 'approved' | 'revisable' | 'rejected'): Promise<Document[]> => {
    try {
      // Try to fetch from MongoDB first
      const documents = await DocumentModel.find({ status }).lean();
      return documents.map(doc => {
        const docData = doc as any;
        return {
          id: docData.id || docData._id.toString(),
          title: docData.title || '',
          userId: docData.userId || '',
          userName: docData.userName || '',
          department: docData.department || '',
          designation: docData.designation || '',
          category: docData.category || '',
          categoryName: docData.categoryName || '',
          fields: docData.fields || {},
          status: docData.status || 'draft',
          credits: docData.credits || 0,
          submittedAt: docData.submittedAt?.toISOString() || new Date().toISOString(),
          updatedAt: docData.updatedAt?.toISOString(),
          reviewedBy: docData.reviewedBy,
          reviewedAt: docData.reviewedAt?.toISOString(),
          revisionComment: docData.revisionComment,
          fileUrl: docData.fileUrl
        } as Document;
      });
    } catch (error) {
      console.error(`Error fetching documents with status ${status} from MongoDB:`, error);
      // Fallback to in-memory filtering if MongoDB fails
      return api.documents.filter(doc => doc.status === status);
    }
  },
  
  // Update user profile in MongoDB
  updateUser: async (userId: string, userData: any): Promise<any> => {
    try {
      // First check if user exists in MongoDB
      let user = await UserModel.findOne({ id: userId }).lean();
      
      if (user) {
        // Update existing user
        console.log('Updating existing user in MongoDB:', userId);
        const result = await UserModel.findOneAndUpdate(
          { id: userId },
          { $set: userData },
          { new: true, runValidators: true }
        );
        return result;
      } else {
        // Create new user if not found
        console.log('Creating new user in MongoDB:', userId);
        userData.id = userId; // Ensure ID is set
        const newUser = await UserModel.create(userData);
        return newUser;
      }
    } catch (error) {
      console.error('Error updating user in MongoDB:', error);
      throw error;
    }
  }
};
