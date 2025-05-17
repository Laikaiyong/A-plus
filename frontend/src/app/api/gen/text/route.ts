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

  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
