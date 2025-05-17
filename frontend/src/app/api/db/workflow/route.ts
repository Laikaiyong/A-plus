import { NextRequest, NextResponse } from 'next/server';

// Base URL for the FastAPI backend
const BACKEND_API_URL = process.env.BACKEND_API_URL;




export async function POST(request: NextRequest) {
  try {
    // Extract form data from the incoming request
    const formData = await request.formData();
    
    // Forward the request to the backend API
    const response = await fetch(`${BACKEND_API_URL}/trigger-workflow`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to trigger workflow');
    }

    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
}