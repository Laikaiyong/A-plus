// src/app/api/nlp/stt/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const audioBuffer = await req.arrayBuffer();

  const res = await fetch('https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr', {
    method: 'POST',
    headers: {
      'X-NLS-Token': 'your_sts_token_or_oss_token', // Optional or getToken if needed
      'Content-Type': 'application/octet-stream',
    },
    body: audioBuffer,
  });

  const textResult = await res.json();
  return NextResponse.json(textResult);
}
