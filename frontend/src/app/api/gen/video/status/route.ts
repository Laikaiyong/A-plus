import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the task ID from query parameters
    const taskId = req.nextUrl.searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Request to check video generation status
    const res = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
      }
    });

    console.log(res);

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Video status check API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to check video status', details: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(data);
    
    // Return the status information
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Video status check request failed:', error);
    return NextResponse.json(
      { error: 'Failed to check video status', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}