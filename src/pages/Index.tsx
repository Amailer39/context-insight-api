import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';
import { DocumentQuery } from '@/components/DocumentQuery';
import { useToast } from '@/hooks/use-toast';
import { api, type Document } from '@/lib/api';

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadDocuments = async (searchQuery?: string) => {
    try {
      const docs = await api.getDocuments(searchQuery);
      setDocuments(docs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load documents.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      toast({
        title: 'Document deleted',
        description: 'The document has been removed.',
      });
      loadDocuments();
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete document.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Brain className="w-16 h-16 text-primary hero-glow relative z-10" />
              <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse"></div>
            </div>
            <h1 className="text-6xl font-extrabold gradient-text tracking-tight">ContextIQ</h1>
          </div>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto font-medium">
            Semantic document search powered by AI
          </p>
          <div className="flex gap-2 justify-center items-center text-sm">
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Neural Search
            </div>
            <div className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
              Real-time Analysis
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <DocumentUpload onUploadSuccess={() => loadDocuments()} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
            onSelect={setSelectedDocument}
            onSearch={(query) => loadDocuments(query || undefined)}
          />
          <DocumentQuery selectedDocument={selectedDocument} />
        </div>
      </div>
    </div>
  );
};

export default Index;
