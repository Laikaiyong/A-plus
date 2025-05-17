// src/app/api/gen/text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  // Read audio as binary
  const arrayBuffer = await req.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);

  // Use correct STT params
  const params = {
    AccessKeyId: process.env.WK_ALI_ACCESS_KEY!,
    Action: 'RecognizeSpeech',
    Version: '2019-02-28',
    Format: 'JSON',
    Timestamp: new Date().toISOString(),
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: Date.now().toString(),
    // Add other required params for STT
  };

  const sortedKeys = Object.keys(params).sort();
  const encode = (str: string) =>
    encodeURIComponent(str)
      .replace(/\+/g, '%20')
      .replace(/\*/g, '%2A')
      .replace(/%7E/g, '~');

  const canonicalQuery = sortedKeys
    .map((k) => `${encode(k)}=${encode(params[k as keyof typeof params])}`)
    .join('&');

  const stringToSign = `POST&%2F&${encode(canonicalQuery)}`;

  const signature = crypto
    .createHmac('sha1', process.env.WK_ALI_ACCESS_SECRET! + '&')
    .update(stringToSign)
    .digest('base64');

  const queryString = new URLSearchParams({ ...params, Signature: signature }).toString();
  const url = `https://nls-meta.cn-shanghai.aliyuncs.com/?${queryString}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav', // Alibaba expects PCM, not webm!
      },
      body: audioBuffer,
      signal: controller.signal,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      data = { message: typeof text === 'string' ? text : String(text) };
    }
    let safeData;
    try {
      safeData = JSON.parse(JSON.stringify(data));
    } catch {
      safeData = { error: 'Response not serializable', raw: String(data) };
    }
    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'API error',
          status: res.status,
          data: safeData
        },
        { status: 500 }
      );
    }
    return NextResponse.json(safeData);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
