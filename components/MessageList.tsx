'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-slate-400 font-medium">No messages yet</p>
          <p className="text-slate-500 text-sm mt-1">Be the first to say something!</p>
        </div>
      </div>
    );
  }

  // Group messages by date and consecutive sender
  const groupedMessages: Array<{
    date: string;
    messages: Array<{ msg: Message; showAvatar: boolean; showUsername: boolean }>;
  }> = [];

  let currentDate = '';
  let currentGroup: { date: string; messages: Array<{ msg: Message; showAvatar: boolean; showUsername: boolean }> } | null = null;

  messages.forEach((msg, index) => {
    const date = formatDate(msg.timestamp);
    if (date !== currentDate) {
      currentDate = date;
      currentGroup = { date, messages: [] };
      groupedMessages.push(currentGroup);
    }

    const prevMsg = messages[index - 1];
    const isSameSender = prevMsg && prevMsg.userId === msg.userId && date === formatDate(prevMsg.timestamp);
    const timeDiff = prevMsg ? msg.timestamp - prevMsg.timestamp : Infinity;
    const showAvatar = !isSameSender || timeDiff > 5 * 60 * 1000;

    currentGroup!.messages.push({ msg, showAvatar, showUsername: showAvatar });
  });

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500 bg-slate-900 px-2">{group.date}</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <div className="space-y-1">
            {group.messages.map(({ msg, showAvatar, showUsername }) => {
              const isOwn = msg.userId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isOwn ? 'flex-row-reverse' : 'flex-row'
                  } ${showAvatar ? 'mt-4' : 'mt-0.5'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8">
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                        {msg.avatar}
                      </div>
                    ) : null}
                  </div>

                  {/* Message bubble */}
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showUsername && !isOwn && (
                      <span className="text-xs text-slate-400 mb-1 ml-1">{msg.username}</span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {showAvatar && (
                      <span className="text-xs text-slate-500 mt-1 mx-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
