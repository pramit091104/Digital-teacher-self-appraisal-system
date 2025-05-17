
import { Category } from "../lib/api";

// Dummy categories data for development purposes
let dummyCategories: Category[] = [
  {
    id: "1",
    name: "Publications",
    description: "Research papers, journal articles, and books published",
    maxCredits: 20,
    perDocumentCredits: 5,
    fields: ["Publication Type", "Title", "Journal/Conference", "Date", "DOI/URL"],
    roleSpecificCriteria: {
      "Professor": { maxCredits: 25, perDocumentCredits: 6 },
      "Associate Professor": { maxCredits: 22, perDocumentCredits: 5 }
    }
  },
  {
    id: "2",
    name: "Industry Contributions",
    description: "Consultations, industry projects, and collaborations",
    maxCredits: 15,
    perDocumentCredits: 3,
    fields: ["Contribution Type", "Company/Organization", "Role", "Duration", "Outcome"],
  },
  {
    id: "3",
    name: "Academic Achievements",
    description: "Awards, recognitions, and academic milestones",
    maxCredits: 10,
    perDocumentCredits: 2,
    fields: ["Achievement Type", "Title", "Awarding Body", "Date", "Description"],
  },
  {
    id: "4",
    name: "Event Participation",
    description: "Conferences, workshops, and seminars attended or organized",
    maxCredits: 12,
    perDocumentCredits: 3,
    fields: ["Event Type", "Event Name", "Location", "Date", "Role", "Certificate"],
  },
  {
    id: "5",
    name: "Certifications",
    description: "Professional certifications, training programs, and courses completed",
    maxCredits: 15,
    perDocumentCredits: 4,
    fields: ["Certification Name", "Issuing Organization", "Date Obtained", "Expiry Date", "Certificate URL"],
  },
  {
    id: "6",
    name: "Student Feedback",
    description: "Student reviews, evaluations, and feedback for teaching",
    maxCredits: 10,
    perDocumentCredits: 2,
    fields: ["Course Code", "Course Name", "Semester", "Year", "Rating", "Comments"],
  },
];

// Get all categories
export const getDummyCategories = (): Category[] => {
  return [...dummyCategories];
};

// Get category by ID
export const getDummyCategoryById = (id: string): Category | undefined => {
  return dummyCategories.find(category => category.id === id);
};

// Add new category
export const addDummyCategory = (category: Omit<Category, "id">): Category => {
  const newCategory = {
    ...category,
    id: `${Date.now()}` // Generate a unique ID
  };
  
  dummyCategories.push(newCategory);
  return newCategory;
};

// Update category
export const updateDummyCategory = (id: string, categoryData: Partial<Category>): Category | null => {
  const index = dummyCategories.findIndex(category => category.id === id);
  
  if (index === -1) return null;
  
  const updatedCategory = {
    ...dummyCategories[index],
    ...categoryData
  };
  
  dummyCategories[index] = updatedCategory;
  return updatedCategory;
};

// Delete category
export const deleteDummyCategory = (id: string): boolean => {
  const initialLength = dummyCategories.length;
  dummyCategories = dummyCategories.filter(category => category.id !== id);
  return dummyCategories.length !== initialLength;
};

// Add role-specific criteria to a category
export const addRoleSpecificCriteria = (
  categoryId: string,
  role: string,
  maxCredits: number,
  perDocumentCredits: number
): Category | null => {
  const category = getDummyCategoryById(categoryId);
  
  if (!category) return null;
  
  const updatedCategory = {
    ...category,
    roleSpecificCriteria: {
      ...(category.roleSpecificCriteria || {}),
      [role]: { maxCredits, perDocumentCredits }
    }
  };
  
  return updateDummyCategory(categoryId, updatedCategory);
};

// Remove role-specific criteria from a category
export const removeRoleSpecificCriteria = (categoryId: string, role: string): Category | null => {
  const category = getDummyCategoryById(categoryId);
  
  if (!category || !category.roleSpecificCriteria || !category.roleSpecificCriteria[role]) {
    return null;
  }
  
  const updatedRoleSpecificCriteria = { ...category.roleSpecificCriteria };
  delete updatedRoleSpecificCriteria[role];
  
  const updatedCategory = {
    ...category,
    roleSpecificCriteria: Object.keys(updatedRoleSpecificCriteria).length > 0 ? updatedRoleSpecificCriteria : undefined
  };
  
  return updateDummyCategory(categoryId, updatedCategory);
};
