import mongoose from 'mongoose';

// MongoDB connection URI - replace with your actual connection string
// Using a direct connection string since process.env is not available in browser context
const MONGODB_URI = 'mongodb://localhost:27017/scholar-scorecard';

// Connect to MongoDB with better error handling
export const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return; // If already connected, return
    }
    
    // Set a connection timeout to avoid hanging
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
    };
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Falling back to local storage mode - MongoDB connection failed');
    // Return false to indicate connection failure
    return false;
  }
};

// Define schemas and models
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  department: String,
  designation: String,
  specialization: String,
  yearJoined: String,
  status: String
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  maxCredits: Number,
  perDocumentCredits: Number,
  fields: [String],
  roleSpecificCriteria: {
    type: Map,
    of: {
      maxCredits: Number,
      perDocumentCredits: Number
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  userId: { type: String, required: true },
  userName: String,
  department: String,
  designation: String,
  category: { type: String, required: true },
  categoryName: String,
  fields: mongoose.Schema.Types.Mixed,
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'revisable', 'rejected'],
    default: 'draft'
  },
  credits: Number,
  submittedAt: { type: Date, default: Date.now },
  updatedAt: Date,
  reviewedBy: String,
  reviewedAt: Date,
  revisionComment: String,
  fileUrl: String
});

// Create models - properly defining them to ensure methods are available
// This approach ensures that models are properly initialized with all Mongoose methods

// Define interfaces for our models
interface UserDocument extends mongoose.Document {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  specialization?: string;
  yearJoined?: string;
  status?: string;
}

interface CategoryDocument extends mongoose.Document {
  id: string;
  name: string;
  description?: string;
  maxCredits?: number;
  perDocumentCredits?: number;
  fields?: string[];
  roleSpecificCriteria?: Map<string, { maxCredits: number; perDocumentCredits: number }>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentDocument extends mongoose.Document {
  id: string;
  title: string;
  userId: string;
  userName?: string;
  department?: string;
  designation?: string;
  category: string;
  categoryName?: string;
  fields: any;
  status: string;
  credits?: number;
  submittedAt: Date;
  updatedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  revisionComment?: string;
  fileUrl?: string;
}

// Create the models with safer initialization
let UserModel: any;
let CategoryModel: any;
let DocumentModel: any;

// Safer model initialization with better error handling for browser environment
try {
  // Try to create models safely
  try {
    UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
  } catch (e) {
    console.log('Creating User model');
    UserModel = mongoose.model<UserDocument>('User', userSchema);
  }
  
  try {
    CategoryModel = mongoose.models.Category || mongoose.model<CategoryDocument>('Category', categorySchema);
  } catch (e) {
    console.log('Creating Category model');
    CategoryModel = mongoose.model<CategoryDocument>('Category', categorySchema);
  }
  
  try {
    DocumentModel = mongoose.models.Document || mongoose.model<DocumentDocument>('Document', documentSchema);
  } catch (e) {
    console.log('Creating Document model');
    DocumentModel = mongoose.model<DocumentDocument>('Document', documentSchema);
  }
} catch (error) {
  console.error('Error initializing MongoDB models:', error);
  
  // Create dummy models for browser environment
  // These will be used when MongoDB is not available
  UserModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    lean: () => Promise.resolve([])
  };
  
  CategoryModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    lean: () => Promise.resolve([])
  };
  
  DocumentModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    lean: () => Promise.resolve([])
  };
}

export { UserModel, CategoryModel, DocumentModel };
