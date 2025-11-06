import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api, type QueryResult, type Document } from '@/lib/api';
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

interface DocumentQueryProps {
  selectedDocument: Document | null;
  user: User | null;
}

export const DocumentQuery = ({ selectedDocument, user }: DocumentQueryProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleQuery = async () => {
    if (!selectedDocument || !query.trim()) return;

    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      const queryResults = await api.queryDocument(selectedDocument.id, query);
      setResults(queryResults);
      
      if (queryResults.length === 0) {
        toast({
          title: 'No results',
          description: 'No relevant content found for your query.',
        });
      }
    } catch (error) {
      toast({
        title: 'Query failed',
        description: 'Failed to query document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedDocument) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-2xl font-semibold gradient-text mb-2">Welcome to ContextIQ</h2>
          <p className="text-muted-foreground">Select a document from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Document Header */}
      <div className="p-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{selectedDocument.title}</h2>
            <p className="text-xs text-muted-foreground">Ask questions about this document</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {results.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ask any question about "{selectedDocument.title}" and get AI-powered insights
            </p>
          </div>
        )}
        
        {results.map((result, idx) => (
          <div key={idx} className="animate-fade-in">
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Send className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <p className="text-sm">{query}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 p-4 rounded-2xl bg-muted/50 border border-border/50">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-muted/50 border border-border/50">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask a question about this document..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleQuery()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleQuery} 
            disabled={isLoading || !query.trim()}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please login or sign up to query documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/auth')}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
