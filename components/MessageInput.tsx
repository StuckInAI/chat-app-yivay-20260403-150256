'use client';

import { useState, KeyboardEvent, FormEvent, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  username: string;
}

export default function MessageInput({ onSend, username }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [username]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    adjustHeight();

    if (!isTyping) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 bg-slate-700 rounded-2xl border border-slate-600 focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #general...`}
            rows={1}
            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none resize-none"
            maxLength={2000}
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-2 ml-1">
        Press <kbd className="bg-slate-700 px-1 rounded text-slate-400">Enter</kbd> to send,{' '}
        <kbd className="bg-slate-700 px-1 rounded text-slate-400">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
