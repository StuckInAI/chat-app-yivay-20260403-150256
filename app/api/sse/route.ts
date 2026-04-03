import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || '';
  const username = request.nextUrl.searchParams.get('username') || 'Anonymous';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // client disconnected
        }
      };

      addClient(userId, username, send);

      // Send initial state
      send({ type: 'connected', userId });

      request.signal.addEventListener('abort', () => {
        removeClient(userId);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
