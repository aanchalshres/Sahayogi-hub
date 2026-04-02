import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { FileText, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Document {
  name: string;
  url: string;
  type: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  organizationName: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documents,
  organizationName,
}: DocumentPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDoc = documents[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0 bg-white">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {organizationName}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              Document {currentIndex + 1} of {documents.length}: {currentDoc?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentDoc?.url, '_blank')}
              className="gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Download', currentDoc?.url)}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        {/* Document Viewer */}
        <div className="relative bg-gray-50 overflow-hidden" style={{ height: '500px' }}>
          {/* Placeholder for document preview */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-700">{currentDoc?.name}</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">PDF Document Preview</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(currentDoc?.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="default"
                className="bg-sahayogi-blue hover:bg-sahayogi-blue-dark"
                onClick={() => console.log('Download', currentDoc?.url)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {documents.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-sahayogi-blue hover:shadow-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-sahayogi-blue hover:shadow-xl transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Document Thumbnails */}
        {documents.length > 1 && (
          <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 overflow-x-auto">
            {documents.map((doc, index) => (
              <button
                key={doc.name}
                onClick={() => setCurrentIndex(index)}
                className={`shrink-0 w-24 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  index === currentIndex
                    ? 'border-sahayogi-blue bg-sahayogi-blue-light'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <FileText
                  className={`w-6 h-6 ${
                    index === currentIndex ? 'text-sahayogi-blue' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs mt-1 truncate w-full px-2 text-center ${
                    index === currentIndex ? 'text-sahayogi-blue' : 'text-gray-500'
                  }`}
                >
                  {doc.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
