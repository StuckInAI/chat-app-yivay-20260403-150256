export interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  avatar: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  joinedAt: number;
  online: boolean;
}

export interface SSEEvent {
  type: 'connected' | 'message' | 'users_update';
  userId?: string;
  message?: Message;
  users?: User[];
}
