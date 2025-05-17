import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (ideally from environment variables)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Extract form data from the incoming request
    const formData = await request.formData();
    
    // Forward the request to the backend API
    const response = await fetch(`${BACKEND_API_URL}/generate-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Extract the storage URL from header
    const storageUrl = response.headers.get('X-Storage-URL') || '';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'X-Storage-URL': storageUrl,
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}