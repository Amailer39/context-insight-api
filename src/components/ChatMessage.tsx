import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 animate-fade-in ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        role === 'user' 
          ? 'bg-primary text-primary-foreground ml-auto' 
          : 'bg-muted/50 border border-border/50'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
      {role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <User className="w-5 h-5 text-accent" />
        </div>
      )}
    </div>
  );
};
