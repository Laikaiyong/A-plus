// src/app/api/nlp/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const res = await fetch('https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts', {
    method: 'POST',
    headers: {
      'X-NLS-Token': 'your_sts_token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appkey: 'your_app_key',
      text,
      format: 'mp3',
      voice: 'xiaoyun', // or any supported voice
    }),
  });

  const audio = await res.arrayBuffer();
  return new NextResponse(Buffer.from(audio), {
    headers: {
      'Content-Type': 'audio/mpeg',
    },
  });
}
