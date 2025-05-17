// src/app/api/nlp/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { text, sourceLang = 'en', targetLang = 'zh' } = await req.json();

  const params = {
    AccessKeyId: process.env.WK_ALI_ACCESS_KEY!,
    Action: 'TranslateGeneral',
    Format: 'JSON',
    Version: '2018-10-12',
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: Date.now().toString(),
    Timestamp: new Date().toISOString(),
    SourceLanguage: sourceLang,
    TargetLanguage: targetLang,
    SourceText: text,
    Scene: 'general',
  };

  const sortedKeys = Object.keys(params).sort();
  const encode = (str: string) =>
    encodeURIComponent(str)
      .replace(/\+/g, '%20')
      .replace(/\*/g, '%2A')
      .replace(/%7E/g, '~');

  const canonicalQuery = sortedKeys
    .map((key) => `${encode(key)}=${encode(params[key as keyof typeof params])}`)
    .join('&');

  const stringToSign = `GET&${encode('/')}&${encode(canonicalQuery)}`;

  const signature = crypto
    .createHmac('sha1', process.env.WK_ALI_ACCESS_SECRET! + '&')
    .update(stringToSign)
    .digest('base64');

  const finalParams = {
    ...params,
    Signature: signature,
  };

  const queryString = new URLSearchParams(finalParams).toString();
  const url = `https://mt.cn-hangzhou.aliyuncs.com/?${queryString}`;


    const result = await fetch(url);
    const json = await result.json();
    return NextResponse.json(json);
}
