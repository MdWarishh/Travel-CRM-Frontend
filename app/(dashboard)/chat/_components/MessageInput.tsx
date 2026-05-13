'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Props {
  onSend: (text: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  sending?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled, sending }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || sending) return;
    onSend(trimmed);
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();
    // Auto resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const canSend = text.trim().length > 0 && !disabled && !sending;

  return (
    <div className="px-4 py-3 border-t border-border bg-card shrink-0">
      <div className="flex items-end gap-2">
        {/* Attach button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground mb-0.5"
          disabled={disabled}
          title="Attach file (coming soon)"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            className={cn(
              'resize-none min-h-[38px] max-h-[120px] py-2 pr-3 text-sm',
              'bg-muted/40 border-0 focus-visible:ring-1 rounded-xl',
              'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
            )}
          />
        </div>

        {/* Emoji */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground mb-0.5"
          disabled={disabled}
          title="Emoji (coming soon)"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Send button */}
        <Button
          size="icon"
          className={cn(
            'h-9 w-9 shrink-0 mb-0.5 rounded-xl transition-all',
            canSend
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 scale-100'
              : 'bg-muted text-muted-foreground scale-95'
          )}
          onClick={handleSend}
          disabled={!canSend}
        >
          {sending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-1.5 ml-11">
        Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Enter</kbd> to send
        · <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}