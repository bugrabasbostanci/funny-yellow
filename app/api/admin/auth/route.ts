import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({
        success: true,
        timestamp: Date.now()
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Admin auth API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}