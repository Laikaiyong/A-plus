// src/app/api/gen/video/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const res = await fetch('https://wan.aliyun.com/api/i2v/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Acs-AccessKey-Id': process.env.WK_ALI_ACCESS_KEY!,
      'X-Acs-AccessKey-Secret': process.env.WK_ALI_ACCESS_SECRET!,
    },
    body: JSON.stringify({
      model: 'wan2.1-i2v-plus',
      prompt,
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
