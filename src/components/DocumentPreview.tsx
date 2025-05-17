import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as mammoth from 'mammoth';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from "@/components/ui/button";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
  file?: File;
  fileUrl?: string;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, fileUrl, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [documentType, setDocumentType] = useState<string>('');
  const [wordContent, setWordContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file) {
      // Handle File object
      const fileType = file.type.toLowerCase();
      setDocumentType(fileType);

      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          fileType === 'application/msword') {
        // Handle Word document
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            if (e.target?.result instanceof ArrayBuffer) {
              const result = await mammoth.convertToHtml({ arrayBuffer: e.target.result });
              setWordContent(result.value);
              setLoading(false);
            } else {
              console.error('Expected ArrayBuffer but got different type');
              setLoading(false);
            }
          } catch (error) {
            console.error('Error converting Word document:', error);
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        setLoading(false);
      }
    } else if (fileUrl) {
      // Handle URL string (from MongoDB)
      const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
      if (extension === 'docx' || extension === 'doc') {
        setDocumentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        // Fetch the Word document from URL
        fetch(fileUrl)
          .then(response => response.arrayBuffer())
          .then(async buffer => {
            try {
              const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
              setWordContent(result.value);
              setLoading(false);
            } catch (error) {
              console.error('Error converting Word document from URL:', error);
              setLoading(false);
            }
          })
          .catch(error => {
            console.error('Error fetching document from URL:', error);
            setLoading(false);
          });
      } else if (extension === 'pdf') {
        setDocumentType('application/pdf');
        setLoading(false);
      } else {
        // Handle other file types or set a default
        setDocumentType('unknown');
        setLoading(false);
      }
    } else {
      // No file or URL provided
      setLoading(false);
      setDocumentType('');
    }
  }, [file, fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setCurrentPage(prevPage => Math.max(1, Math.min(prevPage + offset, numPages)));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Document Preview</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : documentType.includes('pdf') ? (
          <div className="h-[calc(100%-6rem)] overflow-y-auto">
            <Document
              file={file || fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading="Loading document..."
            >
              <Page
                pageNumber={currentPage}
                width={containerRef.current?.clientWidth}
              />
            </Document>
            <div className="flex justify-center space-x-2 p-4 border-t">
              <Button
                variant="outline"
                onClick={() => changePage(-1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {numPages}
              </span>
              <Button
                variant="outline"
                onClick={() => changePage(1)}
                disabled={currentPage >= numPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100%-6rem)] overflow-y-auto p-4">
            <div dangerouslySetInnerHTML={{ __html: wordContent }} />
          </div>
        )}
      </div>
    </div>
  );
};
