// src/app/api/gen/text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const params = {
    AccessKeyId: process.env.WK_ALI_ACCESS_KEY!,
    Action: 'GenerateText',
    Version: '2023-04-01',
    Format: 'JSON',
    Timestamp: new Date().toISOString(),
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: Date.now().toString(),
    Prompt: prompt,
    Model: 'qwen2.5-omni-7b',
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

  const stringToSign = `GET&%2F&${encode(canonicalQuery)}`;

  const signature = crypto
    .createHmac('sha1', process.env.WK_ALI_ACCESS_SECRET! + '&')
    .update(stringToSign)
    .digest('base64');

  const queryString = new URLSearchParams({ ...params, Signature: signature }).toString();
  const url = `https://nls-meta.cn-shanghai.aliyuncs.com/?${queryString}`; // adjust endpoint

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds

  try {
    const res = await fetch(url, { signal: controller.signal });
    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: 'API error', status: res.status, data },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
