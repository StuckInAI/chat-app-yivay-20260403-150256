'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, User, SSEEvent } from '@/lib/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import JoinModal from './JoinModal';

const AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄',
];

function getAvatar(userId: string): string {
  const index = userId.charCodeAt(0) % AVATARS.length;
  return AVATARS[index];
}

export default function ChatApp() {
  const [userId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chat_userId');
      if (stored) return stored;
      const newId = uuidv4();
      localStorage.setItem('chat_userId', newId);
      return newId;
    }
    return uuidv4();
  });

  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const avatar = getAvatar(userId);

  const connectSSE = useCallback(
    (name: string) => {
      const url = `/api/sse?userId=${encodeURIComponent(userId)}&username=${encodeURIComponent(name)}`;
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);

          if (data.type === 'connected') {
            setConnected(true);
          } else if (data.type === 'message' && data.message) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === data.message!.id);
              if (exists) return prev;
              return [...prev, data.message!];
            });
          } else if (data.type === 'users_update' && data.users) {
            setOnlineUsers(data.users);
          }
        } catch {
          // parse error
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource.close();
        setTimeout(() => connectSSE(name), 3000);
      };

      return eventSource;
    },
    [userId]
  );

  useEffect(() => {
    if (!hasJoined || !username) return;

    // Load existing messages
    fetch('/api/messages')
      .then((r) => r.json())
      .then((data: Message[]) => setMessages(data))
      .catch(() => {});

    const es = connectSSE(username);

    return () => {
      es.close();
    };
  }, [hasJoined, username, connectSSE]);

  const handleJoin = (name: string) => {
    setUsername(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_username', name);
    }
    setHasJoined(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, text, avatar }),
      });
    } catch {
      // send error
    }
  };

  if (!hasJoined) {
    return <JoinModal onJoin={handleJoin} />;
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-72 bg-slate-800 border-r border-slate-700
          flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* App Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              💬
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">ChatRoom</h1>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-xs text-slate-400">
                  {connected ? 'Connected' : 'Reconnecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current User */}
        <div className="p-4 border-b border-slate-700">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">You</p>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{avatar}</div>
            <div>
              <p className="text-sm font-semibold text-white">{username}</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
        </div>

        {/* Online Users */}
        <UserList users={onlineUsers} currentUserId={userId} />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h2 className="font-semibold text-white"># general</h2>
            <p className="text-xs text-slate-400">
              {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} online
            </p>
          </div>
        </header>

        {/* Messages */}
        <MessageList messages={messages} currentUserId={userId} />

        {/* Input */}
        <MessageInput onSend={handleSendMessage} username={username} />
      </main>
    </div>
  );
}
