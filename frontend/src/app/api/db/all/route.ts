import { NextResponse } from 'next/server';

// Environment variable for the backend URL
// You may need to add this to your .env.local file
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8090';

export async function GET() {
  try {
    // Fetch data from the backend endpoint that retrieves all data
    const response = await fetch(`${BACKEND_URL}/get-all-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ensure fresh data by disabling cache for this request
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}