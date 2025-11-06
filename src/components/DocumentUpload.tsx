import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { type User } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
  user: User | null;
}

export const DocumentUpload = ({ onUploadSuccess, user }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFile = useCallback(async (file: File) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadDocument(file);
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully.`,
      });
      onUploadSuccess();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast, onUploadSuccess, user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !isUploading && document.getElementById('file-input')?.click()}
      >
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium mb-1">
              {isUploading ? 'Uploading...' : isDragging ? 'Drop here' : 'Upload Document'}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX, or TXT
            </p>
          </div>
        </div>

        <input
          id="file-input"
          type="file"
          onChange={handleFileInput}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          disabled={isUploading}
        />
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please login or sign up to upload documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/auth')}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
