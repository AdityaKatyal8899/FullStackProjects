import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Forward request from Next.js API route to backend
 */
async function forwardRequest(
  request: NextRequest,
  pathSegments: string[]
) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const search = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/auth/${path}${search ? `?${search}` : ''}`;

    // Clone headers from frontend request
    const headers = new Headers();
    request.headers.forEach((value, key) => headers.set(key, value));
    headers.set('Content-Type', 'application/json'); // Ensure JSON

    // Prepare fetch options
    const options: RequestInit = {
      method: request.method,
      headers,
      credentials: 'include', // Important for Passport sessions
    };

    // Attach JSON body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.json();
      options.body = JSON.stringify(body);
    }

    // Send request to backend
    const response = await fetch(backendUrl, options);
    
    // Handle redirects (OAuth callbacks)
    if (response.redirected || response.status === 302 || response.status === 301) {
      return NextResponse.redirect(response.url);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle non-JSON responses (HTML, redirects, etc.)
      const text = await response.text();
      return new NextResponse(text, { 
        status: response.status,
        headers: response.headers
      });
    }
  } catch (err) {
    console.error('Auth API proxy error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  return forwardRequest(request, resolved.path);
}

// POST
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  return forwardRequest(request, resolved.path);
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  return forwardRequest(request, resolved.path);
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  return forwardRequest(request, resolved.path);
}
