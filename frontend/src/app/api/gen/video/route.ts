import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = "1280*720" } = await req.json();
    
    // Initial request to start video generation (async)
    const res = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: "wan2.1-t2v-turbo",
        input: {
          prompt
        },
        parameters: {
          size
        }
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Video generation API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate video', details: errorData },
        { status: res.status }
      );
    }

    // Get the task ID from response
    const data = await res.json();
    console.log(data);
    
    // The response will contain a task_id that can be used to check status
    return NextResponse.json({
      taskId: data.output?.task_id,
      status: 'processing',
      message: 'Video generation started. Use the task ID to check status.'
    });
    
  } catch (error) {
    console.error('Video generation request failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}