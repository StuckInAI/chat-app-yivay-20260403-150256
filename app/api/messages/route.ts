import { NextRequest, NextResponse } from 'next/server';
import { getMessages, addMessage, broadcastToAll } from '@/lib/store';
import type { Message } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const messages = getMessages();
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, username, text, avatar } = body;

  if (!text || !userId || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const message: Message = {
    id: crypto.randomUUID(),
    userId,
    username,
    text: text.trim(),
    avatar,
    timestamp: Date.now(),
  };

  addMessage(message);
  broadcastToAll({ type: 'message', message });

  return NextResponse.json(message, { status: 201 });
}
