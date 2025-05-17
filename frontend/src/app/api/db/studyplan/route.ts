import { NextRequest, NextResponse } from 'next/server';

// Base URL for the FastAPI backend
const BACKEND_API_URL = process.env.BACKEND_API_URL;

// Type definitions
interface StudyPlanData {
  plan_name: string;
  plan_description?: string;
}



// Create study plan API route
export async function POST(request: NextRequest) {
  try {
    // Extract JSON data from the incoming request
    const planData: StudyPlanData = await request.json();
    
    // Forward the request to the backend API
    const response = await fetch(`${BACKEND_API_URL}/create-study-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_name: planData.plan_name,
        plan_description: planData.plan_description
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create study plan');
    }

    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create study plan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const response = await fetch(`${BACKEND_API_URL}/get-study-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch study plans');
    }

    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch study plans' },
      { status: 500 }
    );
  }
}