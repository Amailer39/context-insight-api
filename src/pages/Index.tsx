import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentQuery } from '@/components/DocumentQuery';
import { api, type Document } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, LogOut, LogIn, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const loadDocuments = async () => {
    if (!user) {
      setDocuments([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      await api.deleteDocument(id);
      await loadDocuments();
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleUploadSuccess = () => {
    loadDocuments();
    setUploadDialogOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-accent to-primary p-[2px]">
              <div className="w-full h-full rounded-lg bg-background flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ContextIQ</h1>
              <p className="text-xs text-muted-foreground">AI Document Chat</p>
            </div>
          </div>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')}>
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col">
          {/* Upload Button */}
          <div className="p-4 border-b border-border">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to chat with it using AI
                  </DialogDescription>
                </DialogHeader>
                <DocumentUpload onUploadSuccess={handleUploadSuccess} user={user} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Your Documents
            </h2>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No documents yet</p>
                <p className="text-xs mt-1">Upload a document to get started</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    selectedDocument?.id === doc.id
                      ? 'bg-primary/10 border border-primary/50'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={`w-5 h-5 flex-shrink-0 ${
                      selectedDocument?.id === doc.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(doc.id, e)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-background/50">
          <DocumentQuery selectedDocument={selectedDocument} user={user} />
        </main>
      </div>
    </div>
  );
};

export default Index;
