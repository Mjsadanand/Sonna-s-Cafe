import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req) => {
  const { userId } = req;
  
  return NextResponse.json({
    message: 'This is a protected route',
    userId,
    timestamp: new Date().toISOString()
  });
});

export const POST = requireAuth(async (req) => {
  const { userId } = req;
  const body = await req.json();
  
  return NextResponse.json({
    message: 'Data received in protected route',
    userId,
    data: body,
    timestamp: new Date().toISOString()
  });
});
