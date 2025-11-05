import { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

export const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      await api.uploadDocument(file, title || undefined);
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully.`,
      });
      setTitle('');
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
  }, [title, toast, onUploadSuccess]);

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
    <div className="glass-card rounded-xl p-8 animate-scale-in">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/20 scale-105 glow-effect' 
            : 'border-border/50 hover:border-primary/70 hover:bg-primary/5'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="relative inline-block mb-4">
          <Upload className="w-14 h-14 mx-auto text-primary relative z-10" />
          <div className="absolute inset-0 blur-xl bg-primary/40 animate-pulse"></div>
        </div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Upload Document
        </h3>
        <p className="text-foreground/70 mb-6 font-medium">
          Drag and drop your file here, or click to browse
        </p>

        <div className="max-w-sm mx-auto space-y-4">
          <Input
            type="text"
            placeholder="Document title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50"
          />
          
          <label htmlFor="file-upload">
            <Button 
              variant="default" 
              disabled={isUploading}
              className="w-full cursor-pointer"
              asChild
            >
              <span>
                <FileText className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Select File'}
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileInput}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
