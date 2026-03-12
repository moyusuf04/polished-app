import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Basic in-memory rate limiter for Edge Runtime
// Note: In a serverless environment like Vercel, this Map instance is scoped
// per regional isolate. It provides a "good-enough" free-tier rate limit policy
// without requiring an external Redis instance, perfectly matching MVP constraints.
// 
// Policy: Max 50 requests per IP per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 50;

// The map persists across invocations on the same Edge isolate
const ipRequestMap = new Map<string, { count: number; timestamp: number }>();

export async function proxy(request: NextRequest) {
  // Extract real IP
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for') || 
             'anonymous';

  const rawIp = ip.split(',')[0].trim();
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Memory leak protection: Randomly prune old entries
  if (Math.random() < 0.05) {
    for (const [key, value] of ipRequestMap.entries()) {
      if (value.timestamp < windowStart) {
        ipRequestMap.delete(key);
      }
    }
  }

  const currentWindow = ipRequestMap.get(rawIp);

  if (currentWindow && currentWindow.timestamp > windowStart) {
    currentWindow.count++;
    
    if (currentWindow.count > MAX_REQUESTS) {
      // Return 429 Too Many Requests cleanly without crashing UI
      return new NextResponse(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "You have exceeded the rate limit. Please wait a minute before trying again." 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          } 
        }
      );
    }
  } else {
    // Reset or initialize window for this IP
    ipRequestMap.set(rawIp, { count: 1, timestamp: now });
  }

  // Allow request to proceed to Supabase Auth Middleware
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Apply rate limiting to all paths except static assets and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
