import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api, type QueryResult, type Document } from '@/lib/api';

interface DocumentQueryProps {
  selectedDocument: Document | null;
}

export const DocumentQuery = ({ selectedDocument }: DocumentQueryProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuery = async () => {
    if (!selectedDocument || !query.trim()) return;

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

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold gradient-text">Query Document</h2>
      </div>

      {selectedDocument ? (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Querying:</p>
            <p className="font-medium">{selectedDocument.title}</p>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask a question about this document..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              className="flex-1 bg-background/50"
            />
            <Button 
              onClick={handleQuery} 
              disabled={isLoading || !query.trim()}
              className="px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Results
              </h3>
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-background/30 border border-border/50"
                >
                  <p className="text-sm leading-relaxed">{result.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a document to start querying</p>
        </div>
      )}
    </div>
  );
};
