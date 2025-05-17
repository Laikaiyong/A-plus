import { NextRequest, NextResponse } from "next/server";
import { RPCClient } from "@alicloud/pop-core";

interface TokenInfo {
  token: string;
  expireTime: number; // Timestamp in milliseconds
}

let cachedToken: TokenInfo | null = null;

export async function getAliyunToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expireTime > Date.now() + 60000) {
    // 1 minute buffer
    return cachedToken.token;
  }

  // Create new token
  const client = new RPCClient({
    accessKeyId: process.env.WK_ALI_ACCESS_KEY!,
    accessKeySecret: process.env.WK_ALI_ACCESS_SECRET!,
    endpoint: "http://nlsmeta.cn-shanghai.aliyuncs.com",
    apiVersion: "2019-07-17",
  });

  try {
    const result = await client.request("CreateToken");

    if (!result || !result.Token || !result.Token.Id) {
      throw new Error("Failed to get token from Aliyun API");
    }

    // Cache the token
    cachedToken = {
      token: result.Token.Id,
      // ExpireTime from API is in seconds, convert to milliseconds
      expireTime: result.Token.ExpireTime * 1000,
    };

    console.log(cachedToken);

    return cachedToken.token;
  } catch (error) {
    console.error("Error getting Aliyun token:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    // Get a dynamic token
    const token = await getAliyunToken();

    const encodedText = encodeURIComponent(text).replace(
      /[!'() *]/g,
      function (c) {
        return "%" + c.charCodeAt(0).toString(16);
      }
    );

    // Option 2: Using GET with URL parameters
    const url = new URL(
      "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts"
    );
    url.searchParams.append("appkey", process.env.WK_ALI_APP_KEY!);
    url.searchParams.append("token", token);
    url.searchParams.append("text", encodedText);
    url.searchParams.append("format", "mp3");
    url.searchParams.append("sample_rate", "16000");
    url.searchParams.append("voice", "Siqi");

    const res = await fetch(url.toString(), {
      method: "GET",
    });

    console.log(res);

    if (!res.ok) {
      // If not audio, it's probably an error response in JSON format
      const errorText = await res.text();
      console.error("TTS API error:", errorText);

      return NextResponse.json(
        { error: "Failed to generate audio", details: errorText },
        { status: res.status || 500 }
      );
    }

    // Get the audio data as arrayBuffer
    const audio = await res.arrayBuffer();

    // Return the audio data with proper content type
    return new NextResponse(Buffer.from(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

    // Option 1: Using POST with proper JSON body (recommended for longer text)
    // const res = await fetch(
    //   "https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts",
    //   {
    //     method: "POST",
    //     headers: {
    //       "X-NLS-Token": token,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       appkey: process.env.WK_ALI_APP_KEY!,
    //       text: text,
    //       format: "mp3",
    //       voice: "Siqi"
    //     }),
    //   }
    // );

    // console.log(res);

    // if (!res.ok) {
    //   // If not audio or explicitly JSON, it's probably an error
    //   const errorText = await res.text();
    //   console.error("TTS API error:", errorText);

    //   return NextResponse.json(
    //     { error: "Failed to generate audio", details: errorText },
    //     { status: res.status || 500 }
    //   );
    // }

    // // Get the audio data as arrayBuffer
    // const audio = await res.arrayBuffer();

    // // Return the audio data with proper content type
    // return new NextResponse(Buffer.from(audio), {
    //   headers: {
    //     "Content-Type": "audio/mpeg",
    //   },
    // });
  } catch (error) {
    console.error("TTS API request failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate audio",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
