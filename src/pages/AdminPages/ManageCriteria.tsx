import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { Category } from "../../services/categoryService";
import { toast } from "sonner";
import { fetchCategories, createCategory, updateCategory, deleteCategory as deleteCategoryAPI } from "../../services/categoryService";
import { Button } from "@/components/ui/button";

interface RoleCriteria {
  role: string;
  maxCredits: number;
}

const ManageCriteria = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // State for role-specific criteria
  const [showRoleCriteriaForm, setShowRoleCriteriaForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [roleCriteriaFormData, setRoleCriteriaFormData] = useState<RoleCriteria>({
    role: "",
    maxCredits: 0
  });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxCredits: 10,
    perDocumentCredits: 5,
    fields: [] as string[],
    newField: "",
  });
  
  const roleOptions = ["Assistant Professor", "Associate Professor", "Professor", "HOD", "Principal"];
  
  useEffect(() => {
    fetchCategoriesFromAPI();
  }, []);

  const fetchCategoriesFromAPI = async () => {
    setLoading(true);
    try {
      const apiCategories = await fetchCategories();
      setCategories(apiCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "maxCredits" || name === "perDocumentCredits" ? Number(value) : value
    }));
  };
  
  const handleRoleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoleCriteriaFormData(prev => ({ 
      ...prev, 
      [name]: name === "role" ? value : Number(value)
    }));
  };
  
  const addField = () => {
    if (!formData.newField.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, prev.newField.trim()],
      newField: ""
    }));
  };
  
  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      maxCredits: 10,
      perDocumentCredits: 5,
      fields: [],
      newField: "",
    });
    setShowAddForm(false);
    setEditingCategory(null);
  };
  
  const resetRoleCriteriaForm = () => {
    setRoleCriteriaFormData({
      role: "",
      maxCredits: 0
    });
    setShowRoleCriteriaForm(false);
    setCurrentCategory(null);
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      maxCredits: category.maxCredits,
      perDocumentCredits: category.perDocumentCredits,
      fields: category.fields || [],
      newField: "",
    });
    setShowAddForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await deleteCategoryAPI(id);
      toast.success("Category deleted successfully");
      await fetchCategoriesFromAPI();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    try {
      const categoryData: Partial<Category> = {
        name: formData.name,
        description: formData.description,
        maxCredits: formData.maxCredits,
        perDocumentCredits: formData.perDocumentCredits,
        fields: formData.fields,
      };
      // Only add roleSpecificCriteria if editing and it already exists
      if (editingCategory && editingCategory.roleSpecificCriteria) {
        categoryData.roleSpecificCriteria = editingCategory.roleSpecificCriteria;
      }
      if (editingCategory) {
        // Update existing category via API
        const updatedCategory = await updateCategory(editingCategory.id, categoryData);
        if (updatedCategory) {
          toast.success("Category updated successfully");
        }
      } else {
        // Add new category via API
        const newCategory = await createCategory(categoryData);
        if (newCategory) {
          toast.success("Category created successfully");
        }
      }
      await fetchCategoriesFromAPI();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  
  const openRoleCriteriaForm = (category: Category) => {
    setCurrentCategory(category);
    setShowRoleCriteriaForm(true);
  };
  
  const handleRoleCriteriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory || !roleCriteriaFormData.role) {
      toast.error("Category and role are required");
      return;
    }
    try {
      const { role, maxCredits } = roleCriteriaFormData;
      const updatedRoleSpecificCriteria: Record<string, { maxCredits: number; perDocumentCredits: number }> = {
        ...(currentCategory.roleSpecificCriteria || {}),
        [role]: {
          maxCredits,
          perDocumentCredits: currentCategory.perDocumentCredits
        }
      };
      await updateCategory(currentCategory.id, { roleSpecificCriteria: updatedRoleSpecificCriteria });
      toast.success(`Role criteria for ${role} added successfully`);
      await fetchCategoriesFromAPI();
      resetRoleCriteriaForm();
    } catch (error) {
      console.error("Error adding role criteria:", error);
      toast.error("Failed to add role criteria");
    }
  };

  
  const handleDeleteRoleCriteria = async (categoryId: string, role: string) => {
    if (!window.confirm(`Are you sure you want to delete criteria for ${role}?`)) {
      return;
    }
    try {
      // Find the category
      const category = categories.find(c => c.id === categoryId);
      if (!category || !category.roleSpecificCriteria) return;
      const updatedRoleSpecificCriteria: Record<string, { maxCredits: number; perDocumentCredits: number }> = { ...category.roleSpecificCriteria };
      delete updatedRoleSpecificCriteria[role];
      await updateCategory(categoryId, { roleSpecificCriteria: updatedRoleSpecificCriteria });
      toast.success(`Role criteria for ${role} deleted successfully`);
      await fetchCategoriesFromAPI();
    } catch (error) {
      console.error("Error deleting role criteria:", error);
      toast.error("Failed to delete role criteria");
    }
  };

  
  return (
    <div>
      <Header />
      
      <div className="container mx-auto mt-8 p-4">
        <div className="mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline flex items-center"
          >
            &larr; Back to Dashboard
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Appraisal Criteria</h2>
          
          <Button 
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
              setShowRoleCriteriaForm(false);
            }}
            variant="default"
          >
            {showAddForm ? "Cancel" : "Add New Criteria"}
          </Button>
        </div>
        
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? "Edit Criteria" : "Add New Criteria"}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block mb-2 font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block mb-2 font-medium">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="maxCredits" className="block mb-2 font-medium">
                    Maximum Credits (Default)
                  </label>
                  <input
                    type="number"
                    id="maxCredits"
                    name="maxCredits"
                    value={formData.maxCredits}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min={1}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="perDocumentCredits" className="block mb-2 font-medium">
                    Credits Per Document (Default)
                  </label>
                  <input
                    type="number"
                    id="perDocumentCredits"
                    name="perDocumentCredits"
                    value={formData.perDocumentCredits}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min={1}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-medium">Fields</label>
                
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    name="newField"
                    value={formData.newField}
                    onChange={handleChange}
                    placeholder="Add a field"
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg"
                  />
                  <button
                    type="button"
                    onClick={addField}
                    className="px-4 py-3 bg-accent text-white rounded-r-lg"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-2">
                  {formData.fields.map((field, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <span className="flex-grow p-2 bg-gray-100 rounded-l-lg border border-gray-300">
                        {field}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="px-3 py-2 bg-destructive text-white rounded-r-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-md"
                >
                  {editingCategory ? "Update Criteria" : "Save Criteria"}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {showRoleCriteriaForm && currentCategory && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">
              Add Role-Specific Criteria for {currentCategory.name}
            </h3>
            
            <form onSubmit={handleRoleCriteriaSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="role" className="block mb-2 font-medium">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={roleCriteriaFormData.role}
                    onChange={handleRoleCriteriaChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select a role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="maxCredits" className="block mb-2 font-medium">
                    Maximum Credits for Role
                  </label>
                  <input
                    type="number"
                    id="maxCredits"
                    name="maxCredits"
                    value={roleCriteriaFormData.maxCredits}
                    onChange={handleRoleCriteriaChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min={1}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetRoleCriteriaForm}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-md"
                >
                  Save Role Criteria
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Max Credits</th>
                  <th className="py-3 px-4 text-left">Per Document</th>
                  <th className="py-3 px-4 text-left">Fields</th>
                  <th className="py-3 px-4 text-left">Role Criteria</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center">
                      No criteria defined yet
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">{category.description || "-"}</td>
                      <td className="py-3 px-4">{category.maxCredits}</td>
                      <td className="py-3 px-4">{category.perDocumentCredits}</td>
                      <td className="py-3 px-4">
                        {category.fields && category.fields.length > 0 
                          ? category.fields.slice(0, 3).join(", ") + (category.fields.length > 3 ? "..." : "")
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {category.roleSpecificCriteria && Object.keys(category.roleSpecificCriteria).length > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(category.roleSpecificCriteria).map(([role, criteria]) => (
                              <div key={role} className="bg-gray-100 p-1 rounded flex justify-between items-center">
                                <span className="text-xs">
                                  <strong>{role}</strong>: Max {criteria.maxCredits} credits
                                </span>
                                <button
                                  onClick={() => handleDeleteRoleCriteria(category.id, role)}
                                  className="text-destructive hover:text-destructive/80 text-xs"
                                  title={`Delete ${role} criteria`}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                        <button
                          onClick={() => openRoleCriteriaForm(category)}
                          className="mt-2 px-2 py-1 bg-accent hover:bg-accent/80 text-white text-xs rounded"
                        >
                          Add Role Criteria
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 bg-accent hover:bg-accent/80 text-white rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="px-3 py-1 bg-destructive hover:bg-destructive/80 text-white rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCriteria;
