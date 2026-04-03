import { NextResponse } from 'next/server';
import { getOnlineUsers } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = getOnlineUsers();
  return NextResponse.json(users);
}
