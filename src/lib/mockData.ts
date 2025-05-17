
import { User, Category, Document } from "./api";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Jyoti Nandimath",
    email: "jyoti@example.com",
    role: "faculty",
    department: "Computer Science",
    designation: "Assistant Professor",
    specialization: "Database Management",
    yearJoined: "2018",
  },
  {
    id: "user2",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "user3",
    name: "Rupali Bhatkande",
    email: "rupali@example.com",
    role: "faculty",
    department: "Information Technology",
    designation: "Assistant Professor",
    specialization: "Machine Learning",
    yearJoined: "2019",
  },
  {
    id: "user4",
    name: "Rahul Bhole",
    email: "rahul@example.com",
    role: "faculty",
    department: "Electronics",
    designation: "Assistant Professor",
    specialization: "VLSI Design",
    yearJoined: "2020",
  },
  {
    id: "user5",
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "hod",
    department: "Computer Science",
    designation: "Professor",
    specialization: "Artificial Intelligence",
    yearJoined: "2010",
  }
];

export const mockCategories: Category[] = [
  {
    id: "cat1",
    name: "Research Publication",
    description: "Journal articles, conference papers, etc.",
    maxCredits: 50,
    perDocumentCredits: 10,
    fields: [
      "Title of the Paper",
      "Author(s)",
      "ISSN / ISBN Number",
      "Impact Factor",
      "Research Area/ Domain",
      "Publication Year",
      "Publication Name",
      "Publication Type",
    ]
  },
  {
    id: "cat2",
    name: "Book Publication",
    description: "Published books and book chapters",
    maxCredits: 30,
    perDocumentCredits: 15,
    fields: [
      "Book Title",
      "Publisher",
      "ISBN",
      "Publication Year",
      "Role (Author/Editor)",
    ]
  },
  {
    id: "cat3",
    name: "Patents / Copyrights",
    description: "Filed or granted patents",
    maxCredits: 40,
    perDocumentCredits: 20,
    fields: [
      "Patent Title",
      "Patent Number",
      "Filing Date",
      "Status",
      "Inventors",
    ]
  },
  {
    id: "cat4",
    name: "Conference Papers / Proceedings",
    description: "Papers presented at conferences",
    maxCredits: 25,
    perDocumentCredits: 5,
    fields: [
      "Conference Name",
      "Paper Title",
      "Authors",
      "Date",
      "Venue",
      "Proceedings ISBN",
    ]
  },
  {
    id: "cat5",
    name: "Academic Achievements / Certifications",
    description: "Academic recognitions and certifications",
    maxCredits: 20,
    perDocumentCredits: 5,
    fields: [
      "Achievement/Certification Name",
      "Issuing Organization",
      "Date",
      "Certificate ID",
      "Validation Link",
    ]
  },
  {
    id: "cat6",
    name: "Event Participation",
    description: "Workshops, seminars, and events",
    maxCredits: 15,
    perDocumentCredits: 3,
    fields: [
      "Event Name",
      "Organizer",
      "Date",
      "Role",
      "Certificate",
    ]
  },
  {
    id: "cat7",
    name: "Industry Contribution / Participation",
    description: "Industry collaborations and projects",
    maxCredits: 25,
    perDocumentCredits: 8,
    fields: [
      "Company/Organization",
      "Project Name",
      "Role",
      "Duration",
      "Outcome",
    ]
  },
  {
    id: "cat8",
    name: "Student Feedbacks / Reviews",
    description: "Student feedback and evaluations",
    maxCredits: 10,
    perDocumentCredits: 2,
    fields: [
      "Course",
      "Semester",
      "Year",
      "Average Rating",
      "Number of Students",
    ]
  },
];

export const mockDocuments: Document[] = [
  {
    id: "doc1",
    title: "A Review on Cyber Security and the Fifth Generation Cyberattacks",
    userId: "user3",
    userName: "Rupali Bhatkande",
    department: "Information Technology",
    designation: "Assistant Professor",
    category: "cat1",
    categoryName: "Research Publication",
    status: "pending",
    credits: 5,
    submittedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    fields: {
      'Publication Type': 'Journal Article',
      'Title': 'A Review on Cyber Security and the Fifth Generation Cyberattacks',
      'Journal/Conference': 'International Journal of Computer Science',
      'Date': '2023-10-15',
      'DOI/URL': 'https://example.com/doi/123456'
    }
  },
  {
    id: "doc2",
    title: "Machine Learning Applications in Healthcare",
    userId: "user1",
    userName: "Jyoti Nandimath",
    department: "Computer Science",
    designation: "Assistant Professor",
    category: "cat1",
    categoryName: "Research Publication",
    status: "approved",
    credits: 10,
    submittedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    reviewedAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    reviewedBy: "user5",
    fields: {
      'Publication Type': 'Conference Paper',
      'Title': 'Machine Learning Applications in Healthcare',
      'Journal/Conference': 'IEEE International Conference on Healthcare Informatics',
      'Date': '2023-08-10',
      'DOI/URL': 'https://example.com/doi/789012'
    }
  },
  {
    id: "doc2",
    title: "Analysis of Machine Learning Approaches in IoT Security",
    category: "cat1",
    categoryName: "Research Publication",
    userId: "user3",
    userName: "Rupali Bhatkande",
    credits: 10,
    status: "pending",
    submittedAt: "2023-02-05T09:15:00Z",
    fields: {
      "ISSN / ISBN Number": "1234-5678",
      "Research Area/ Domain": "IoT Security",
      "Publication Year": "2023",
      "Publication Name": "Journal of IoT and Applications",
      "Impact Factor": "2.3",
      "Role in the Paper": "First Author",
      "Publication Type": "Journal Article",
      "Author(s)": "Rupali Bhatkande, A. Sharma",
    }
  },
  {
    id: "doc3",
    title: "FPGA Implementation of Low-Power VLSI Architectures",
    category: "cat1",
    categoryName: "Research Publication",
    userId: "user4",
    userName: "Rahul Bhole",
    credits: 10,
    status: "pending",
    submittedAt: "2023-02-10T11:20:00Z",
    fields: {
      "ISSN / ISBN Number": "2345-6789",
      "Research Area/ Domain": "VLSI Design",
      "Publication Year": "2023",
      "Publication Name": "International Journal of VLSI Design",
      "Impact Factor": "1.8",
      "Role in the Paper": "First Author",
      "Publication Type": "Journal Article",
      "Author(s)": "Rahul Bhole, B. Kumar",
    }
  },
];

// Mock the API calls
export const setupMockAPI = () => {
  // Override the actual API methods with mock implementations
  const originalApi = { ...api };
  
  // Initialize the API documents array with mock documents
  api.documents = [...mockDocuments];
  
  // Mock the API methods
  api.getUsers = async () => [...mockUsers];
  api.getCategories = async () => [...mockCategories];
  api.getDocuments = async (userId?: string) => {
    if (userId) {
      return api.documents.filter(doc => doc.userId === userId);
    }
    return [...api.documents];
  };
  api.getDocumentsByStatus = async (status) => {
    return api.documents.filter(doc => doc.status === status);
  };
  
  return originalApi; // Return original API in case we need to restore it
};

// Import the actual API to override
import { api } from "./api";
