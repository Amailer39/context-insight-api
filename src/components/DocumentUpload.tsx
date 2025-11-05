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
    <div className="glass-card rounded-xl p-8 transition-all duration-300 hover:glow-effect">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/10 scale-105' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Upload Document</h3>
        <p className="text-muted-foreground mb-6">
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
