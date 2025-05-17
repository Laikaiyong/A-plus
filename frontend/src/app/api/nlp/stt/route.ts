// src/app/api/nlp/stt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Core from '@alicloud/pop-core';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { exec } from 'child_process';

interface TokenResponse {
  Token: string;
  ExpireTime: string;
}

async function getIsiToken(): Promise<string> {
  const client = new Core({
    accessKeyId: process.env.WK_ALI_ACCESS_KEY!,
    accessKeySecret: process.env.WK_ALI_ACCESS_SECRET!,
    endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
    apiVersion: '2019-02-28',
  });

  const result = await client.request('CreateToken', {}, { method: 'POST' }) as TokenResponse;
  return result.Token;
}

function convertWebmToPcm(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${inputPath}" -f s16le -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = await getIsiToken();
    const audioBuffer = await req.arrayBuffer();

    const inputPath = path.join(tmpdir(), `input-${Date.now()}.webm`);
    const outputPath = path.join(tmpdir(), `output-${Date.now()}.pcm`);

    writeFileSync(inputPath, Buffer.from(audioBuffer));
    await convertWebmToPcm(inputPath, outputPath);

    const pcmData = readFileSync(outputPath);
    unlinkSync(inputPath);
    unlinkSync(outputPath);

    const aliyunUrl = `https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr?appkey=${process.env.WK_ALI_APP_KEY}&format=pcm&sample_rate=16000&enable_punctuation_prediction=true`;

    const aliyunResponse = await fetch(aliyunUrl, {
      method: 'POST',
      headers: {
        'X-NLS-Token': token,
        'Content-Type': 'application/octet-stream',
        'Content-Length': pcmData.byteLength.toString(),
      },
      body: pcmData,
    });

    const result = await aliyunResponse.json();
    console.log(result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error sending audio:', err.message);
      return NextResponse.json(
        { error: 'Failed to transcribe audio: ' + err.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', err);
      return NextResponse.json(
        { error: 'Failed to transcribe audio.' },
        { status: 500 }
      );
    }
  }
}