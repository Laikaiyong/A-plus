// src/app/api/gen/text/route.ts
import { NextRequest, NextResponse } from 'next/server';

function stripWavHeader(buffer: Buffer): Buffer {
  // Remove the 44-byte WAV header to get raw PCM
  return buffer.subarray(44);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get token from Alibaba
    const tokenRes = await fetch('https://nls-meta.ap-southeast-1.aliyuncs.com/pop/2018-05-18/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AccessKeyId: process.env.WK_ALI_ACCESS_KEY,
        AccessKeySecret: process.env.WK_ALI_ACCESS_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData?.Token?.Id;
    if (!token) {
      return NextResponse.json({ error: 'Failed to get token', data: tokenData }, { status: 500 });
    }

    // 2. Read and strip WAV header to get PCM
    const arrayBuffer = await req.arrayBuffer();
    const wavBuffer = Buffer.from(arrayBuffer);
    const pcmBuffer = stripWavHeader(wavBuffer);

    // 3. Call ASR API with all required headers
    const appkey = process.env.WK_ALI_APP_KEY!;
    const url = `https://nls-gateway-ap-southeast-1.aliyuncs.com/stream/v1/asr?appkey=${appkey}&format=pcm&sample_rate=16000`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'X-NLS-Token': token,
          'Content-Type': 'application/octet-stream',
          'Content-Length': pcmBuffer.length.toString(),
          'Host': 'nls-gateway-ap-southeast-1.aliyuncs.com',
        },
        body: pcmBuffer,
        signal: controller.signal,
      });

      let data;
      let rawText = '';
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        rawText = await res.text();
        data = { error: rawText };
      }
      if (!res.ok) {
        return NextResponse.json(
          { error: 'API error', status: res.status, data },
          { status: 500 }
        );
      }
      if (data && data.error) {
        console.error('Alibaba XML error:', data.error);
      }
      return NextResponse.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
