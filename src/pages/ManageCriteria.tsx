
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { Check, X, Plus, Trash, Edit } from "lucide-react";

interface Criterion {
  id: string;
  name: string;
  description: string;
  maxCredits: number;
  perDocumentCredits: number;
  fields: string[];
  roleSpecificCriteria?: Record<string, { maxCredits: number; perDocumentCredits: number }>;
}

interface RoleCriteriaFormData {
  role: string;
  maxCredits: number;
  perDocumentCredits: number;
}

const roleOptions = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "HOD",
  "Principal"
];

const ManageCriteria = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [showRoleCriteriaForm, setShowRoleCriteriaForm] = useState(false);
  const [currentCriterion, setCurrentCriterion] = useState<Criterion | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxCredits: 10,
    perDocumentCredits: 5,
    fields: [] as string[],
    newField: "",
  });
  
  const [roleCriteriaFormData, setRoleCriteriaFormData] = useState<RoleCriteriaFormData>({
    role: "",
    maxCredits: 0,
    perDocumentCredits: 0,
  });

  useEffect(() => {
    // Verify admin access
    if (userData && userData.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
      return;
    }
    
    fetchCriteria();
  }, [userData, navigate]);

  // Mock function to fetch criteria
  const fetchCriteria = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to fetch criteria
      // For now, we'll use dummy data
      const dummyCriteria: Criterion[] = [
        {
          id: "1",
          name: "Publications",
          description: "Academic papers, journal articles, and books published",
          maxCredits: 20,
          perDocumentCredits: 5,
          fields: ["Publication Type", "Title", "Journal/Conference", "Date", "DOI/URL"],
        },
        {
          id: "2",
          name: "Industry Contributions",
          description: "Consultation, industry projects, and collaborations",
          maxCredits: 15,
          perDocumentCredits: 3,
          fields: ["Contribution Type", "Company/Organization", "Role", "Duration", "Outcome"],
          roleSpecificCriteria: {
            "Professor": { maxCredits: 20, perDocumentCredits: 4 }
          }
        },
        {
          id: "3",
          name: "Academic Achievements",
          description: "Awards, recognitions, and academic milestones",
          maxCredits: 10,
          perDocumentCredits: 2,
          fields: ["Achievement Type", "Title", "Awarding Body", "Date", "Description"]
        }
      ];
      
      setCriteria(dummyCriteria);
    } catch (error) {
      console.error("Error fetching criteria:", error);
      toast.error("Failed to load criteria");
    } finally {
      setLoading(false);
    }
  };

  // Form handling functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "maxCredits" || name === "perDocumentCredits" ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "role") {
      setRoleCriteriaFormData(prev => ({ ...prev, role: value }));
    }
  };

  const handleNumberChange = (name: string, value: string) => {
    if (name === "maxCredits" || name === "perDocumentCredits") {
      setRoleCriteriaFormData(prev => ({ 
        ...prev, 
        [name]: Number(value)
      }));
    }
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
    setEditingCriterion(null);
    setShowAddForm(false);
  };

  const resetRoleCriteriaForm = () => {
    setRoleCriteriaFormData({
      role: "",
      maxCredits: 0,
      perDocumentCredits: 0,
    });
    setShowRoleCriteriaForm(false);
    setCurrentCriterion(null);
  };

  const handleEdit = (criterion: Criterion) => {
    setEditingCriterion(criterion);
    setFormData({
      name: criterion.name,
      description: criterion.description,
      maxCredits: criterion.maxCredits,
      perDocumentCredits: criterion.perDocumentCredits,
      fields: criterion.fields || [],
      newField: "",
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this criterion?")) {
      setCriteria(prev => prev.filter(c => c.id !== id));
      toast.success("Criterion deleted successfully");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    
    if (formData.fields.length === 0) {
      toast.error("At least one field is required");
      return;
    }
    
    const criterionData = {
      name: formData.name,
      description: formData.description,
      maxCredits: formData.maxCredits,
      perDocumentCredits: formData.perDocumentCredits,
      fields: formData.fields,
    };
    
    if (editingCriterion) {
      // Update existing criterion
      setCriteria(prev => 
        prev.map(c => c.id === editingCriterion.id ? { ...c, ...criterionData } : c)
      );
      toast.success("Criterion updated successfully");
    } else {
      // Add new criterion with a unique ID
      const newId = `${Date.now()}`;
      setCriteria(prev => [...prev, { id: newId, ...criterionData }]);
      toast.success("Criterion added successfully");
    }
    
    resetForm();
  };

  const openRoleCriteriaForm = (criterion: Criterion) => {
    setCurrentCriterion(criterion);
    setRoleCriteriaFormData({
      role: "",
      maxCredits: criterion.maxCredits,
      perDocumentCredits: criterion.perDocumentCredits,
    });
    setShowRoleCriteriaForm(true);
  };

  const handleRoleCriteriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCriterion || !roleCriteriaFormData.role) {
      toast.error("Criterion and role are required");
      return;
    }
    
    // Update the criterion with role-specific criteria
    const updatedCriteria = criteria.map(c => {
      if (c.id === currentCriterion.id) {
        const roleSpecificCriteria = c.roleSpecificCriteria || {};
        
        return {
          ...c,
          roleSpecificCriteria: {
            ...roleSpecificCriteria,
            [roleCriteriaFormData.role]: {
              maxCredits: roleCriteriaFormData.maxCredits,
              perDocumentCredits: roleCriteriaFormData.perDocumentCredits,
            }
          }
        };
      }
      return c;
    });
    
    setCriteria(updatedCriteria);
    toast.success(`Role criteria for ${roleCriteriaFormData.role} added successfully`);
    resetRoleCriteriaForm();
  };

  const handleDeleteRoleCriteria = (criterionId: string, role: string) => {
    if (window.confirm(`Are you sure you want to delete criteria for ${role}?`)) {
      setCriteria(prev => 
        prev.map(c => {
          if (c.id === criterionId && c.roleSpecificCriteria) {
            const updatedRoleSpecificCriteria = { ...c.roleSpecificCriteria };
            delete updatedRoleSpecificCriteria[role];
            
            return {
              ...c,
              roleSpecificCriteria: updatedRoleSpecificCriteria
            };
          }
          return c;
        })
      );
      
      toast.success(`Role criteria for ${role} deleted successfully`);
    }
  };

  return (
    <div>
      <Header />
      
      <div className="container mx-auto p-4 mt-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Appraisal Criteria</h2>
          
          <Button 
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
              setShowRoleCriteriaForm(false);
            }}
          >
            {showAddForm ? "Cancel" : "Add New Criterion"}
          </Button>
        </div>
        
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingCriterion ? "Edit Criterion" : "Add New Criterion"}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Publications"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of this criterion"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxCredits">Maximum Credits (Default)</Label>
                    <Input
                      type="number"
                      id="maxCredits"
                      name="maxCredits"
                      value={formData.maxCredits}
                      onChange={handleChange}
                      min={1}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="perDocumentCredits">Credits Per Document (Default)</Label>
                    <Input
                      type="number"
                      id="perDocumentCredits"
                      name="perDocumentCredits"
                      value={formData.perDocumentCredits}
                      onChange={handleChange}
                      min={1}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6 space-y-2">
                  <Label>Fields</Label>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      name="newField"
                      value={formData.newField}
                      onChange={handleChange}
                      placeholder="Add a field (e.g., Title, Publication Date)"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={addField}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {formData.fields.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No fields added. Add fields that faculty will need to fill out.
                      </div>
                    )}
                    
                    {formData.fields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span>{field}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeField(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCriterion ? "Update Criterion" : "Save Criterion"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {showRoleCriteriaForm && currentCriterion && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add Role-Specific Criteria for {currentCriterion.name}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleRoleCriteriaSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={roleCriteriaFormData.role} 
                      onValueChange={(value) => handleSelectChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roleMaxCredits">Maximum Credits for Role</Label>
                    <Input
                      type="number"
                      id="roleMaxCredits"
                      value={roleCriteriaFormData.maxCredits}
                      onChange={(e) => handleNumberChange("maxCredits", e.target.value)}
                      min={1}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rolePerDocumentCredits">Credits Per Document for Role</Label>
                    <Input
                      type="number"
                      id="rolePerDocumentCredits"
                      value={roleCriteriaFormData.perDocumentCredits}
                      onChange={(e) => handleNumberChange("perDocumentCredits", e.target.value)}
                      min={1}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetRoleCriteriaForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Role Criteria
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {criteria.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="mb-4">No criteria defined yet</div>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Criterion
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-left">Max Credits</th>
                      <th className="py-3 px-4 text-left">Per Document</th>
                      <th className="py-3 px-4 text-left">Fields</th>
                      <th className="py-3 px-4 text-left">Role-Specific</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((criterion) => (
                      <tr key={criterion.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{criterion.name}</td>
                        <td className="py-3 px-4">{criterion.description}</td>
                        <td className="py-3 px-4">{criterion.maxCredits}</td>
                        <td className="py-3 px-4">{criterion.perDocumentCredits}</td>
                        <td className="py-3 px-4">
                          {criterion.fields.length > 0 ? (
                            <span>{criterion.fields.slice(0, 3).join(", ")}{criterion.fields.length > 3 ? "..." : ""}</span>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {criterion.roleSpecificCriteria && Object.keys(criterion.roleSpecificCriteria).length > 0 ? (
                            <div className="space-y-1">
                              {Object.entries(criterion.roleSpecificCriteria).map(([role, criteria]) => (
                                <div key={role} className="flex justify-between items-center bg-muted p-1 rounded text-xs">
                                  <span>
                                    <strong>{role}</strong>: {criteria.maxCredits} max / {criteria.perDocumentCredits} per doc
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 text-destructive"
                                    onClick={() => handleDeleteRoleCriteria(criterion.id, role)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                          <div className="mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => openRoleCriteriaForm(criterion)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Role Criteria
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(criterion)}
                              className="flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(criterion.id)}
                              className="flex items-center"
                            >
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCriteria;
