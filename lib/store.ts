import type { Message, User } from './types';

type SendFn = (data: object) => void;

interface ClientEntry {
  userId: string;
  username: string;
  send: SendFn;
}

declare global {
  // eslint-disable-next-line no-var
  var __chatStore: {
    messages: Message[];
    clients: Map<string, ClientEntry>;
    users: Map<string, User>;
  } | undefined;
}

function getStore() {
  if (!global.__chatStore) {
    global.__chatStore = {
      messages: [],
      clients: new Map(),
      users: new Map(),
    };
  }
  return global.__chatStore;
}

const AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄',
];

function getAvatar(userId: string): string {
  const index = userId.charCodeAt(0) % AVATARS.length;
  return AVATARS[index];
}

export function addClient(userId: string, username: string, send: SendFn): void {
  const store = getStore();
  store.clients.set(userId, { userId, username, send });

  const user: User = {
    id: userId,
    username,
    avatar: getAvatar(userId),
    joinedAt: Date.now(),
    online: true,
  };
  store.users.set(userId, user);

  broadcastToAll({ type: 'users_update', users: getOnlineUsers() });
}

export function removeClient(userId: string): void {
  const store = getStore();
  store.clients.delete(userId);
  store.users.delete(userId);

  broadcastToAll({ type: 'users_update', users: getOnlineUsers() });
}

export function getMessages(): Message[] {
  return getStore().messages.slice(-100);
}

export function addMessage(message: Message): void {
  const store = getStore();
  store.messages.push(message);
  if (store.messages.length > 200) {
    store.messages = store.messages.slice(-100);
  }
}

export function getOnlineUsers(): User[] {
  return Array.from(getStore().users.values());
}

export function broadcastToAll(data: object): void {
  const store = getStore();
  store.clients.forEach((client) => {
    client.send(data);
  });
}
