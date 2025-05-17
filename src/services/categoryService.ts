import { api } from './apiService';

export interface Category {
  _id?: string;
  name: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  maxCredits: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Fetch category by ID
export const fetchCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const response = await api.get<Category>(`/categories/${categoryId}`);
    
    if (response.error) {
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
};

// Create a new category
export const createCategory = async (categoryData: Partial<Category>): Promise<Category | null> => {
  try {
    const response = await api.post<Category>('/categories', categoryData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
};

// Update an existing category
export const updateCategory = async (categoryId: string, categoryData: Partial<Category>): Promise<Category | null> => {
  try {
    const response = await api.put<Category>(`/categories/${categoryId}`, categoryData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const response = await api.delete<{message: string}>(`/categories/${categoryId}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};
