
import React, { useState } from "react";
import { Document } from "../lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ReviewerDashboardProps {
  documents: Document[];
  onApprove: (id: string) => Promise<void>;
  onRevise: (id: string, comment: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  title?: string;
}

export const ReviewerDashboard = ({ documents, onApprove, onRevise, onDelete, title }: ReviewerDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [revisionComment, setRevisionComment] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleReviseClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleReviseSubmit = async () => {
    if (!selectedDocument) return;
    try {
      await onRevise(selectedDocument.id, revisionComment);
      toast.success("Document marked for revision");
      setSelectedDocument(null);
      setRevisionComment("");
    } catch (error) {
      toast.error("Failed to mark document for revision");
      console.error(error);
    }
  };

  // Filter documents based on status and search query
  const pendingDocuments = documents
    .filter(doc => doc && doc.status === "pending")
    .filter(doc =>
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Handle potential undefined dates by providing defaults
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      
      if (sortBy === "date-asc") {
        return dateA - dateB;
      }
      if (sortBy === "date-desc") {
        return dateB - dateA;
      }
      if (sortBy === "title-asc") {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === "title-desc") {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

  const approvedDocuments = documents
    .filter(doc => doc && doc.status === "approved")
    .filter(doc =>
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Handle potential undefined dates by providing defaults
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      
      if (sortBy === "date-asc") {
        return dateA - dateB;
      }
      if (sortBy === "date-desc") {
        return dateB - dateA;
      }
      if (sortBy === "title-asc") {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === "title-desc") {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

  return (
    <div>
      <div className="flex justify-between mb-6 items-center">
        <h2 className="text-xl font-bold">{title || "Documents for Review"}</h2>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setFilterStatus("all")}
            variant={filterStatus === "all" ? "default" : "outline"}
          >
            All
          </Button>
          <Button
            onClick={() => setFilterStatus("pending")}
            variant={filterStatus === "pending" ? "default" : "outline"}
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilterStatus("approved")}
            variant={filterStatus === "approved" ? "default" : "outline"}
          >
            Approved
          </Button>
          <Button
            onClick={() => setFilterStatus("revisable")}
            variant={filterStatus === "revisable" ? "default" : "outline"}
          >
            Needs Revision
          </Button>
        </div>
      </div>
      
      {/* Search & Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Latest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Dashboard layout showing both pending and approved documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Documents */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Review</h3>
          <div className="space-y-4">
            {pendingDocuments.length > 0 ? (
              pendingDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{doc.title || 'Untitled Document'}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {doc.userName || 'Unknown User'} • {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : 'Unknown Date'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Pending
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Category:</span> {doc.categoryName || 'Uncategorized'}
                    </p>
                    {doc.fileUrl && (
                      <p className="text-sm mt-1 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="font-medium">Document attached</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
                      <Link to={`/document/${doc.id}`}>
                        <Eye className="h-4 w-4" />
                        View Document
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onApprove(doc.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReviseClick(doc)}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      Needs Revision
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                            onDelete(doc.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No pending documents</p>
              </div>
            )}
          </div>
        </div>

        {/* Approved Documents */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Approved Documents</h3>
          <div className="space-y-4">
            {approvedDocuments.length > 0 ? (
              approvedDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{doc.title || 'Untitled Document'}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {doc.userName || 'Unknown User'} • {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : 'Unknown Date'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-600">
                        Approved
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Category:</span> {doc.categoryName || 'Uncategorized'}
                    </p>
                    {doc.fileUrl && (
                      <p className="text-sm mt-1 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="font-medium">Document attached</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
                      <Link to={`/document/${doc.id}`}>
                        <Eye className="h-4 w-4" />
                        View Document
                      </Link>
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                            onDelete(doc.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No approved documents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revision modal */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Add a comment to the document to request a revision.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Enter revision comments..."
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleReviseSubmit}>Request revision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
