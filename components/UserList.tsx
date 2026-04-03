'use client';

import type { User } from '@/lib/types';

interface UserListProps {
  users: User[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
        Online — {users.length}
      </p>
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              user.id === currentUserId
                ? 'bg-slate-700/50'
                : 'hover:bg-slate-700/30'
            }`}
          >
            {/* Avatar with presence indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-slate-800" />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user.username}
                {user.id === currentUserId && (
                  <span className="text-xs text-slate-500 ml-1">(you)</span>
                )}
              </p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No one online</p>
        )}
      </div>
    </div>
  );
}
