// src/app/api/gen/text/route.ts
import { NextRequest } from 'next/server';
import OpenAI from "openai";

export const runtime = 'edge'; // Enable streaming in Next.js API routes

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
  });

  const completion = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      { role: "system", content: "You are a helpful virtual learning instructor that curates personalized study experience to individuals" },
      { role: "user", content: prompt }
    ],
  });

  console.log(JSON.stringify(completion))

  const completionText = JSON.stringify(completion)

  return new Response(completionText);
}

// Client-side code
const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  const newUserMessage = {
    id: messages.length + 1,
    sender: 'user',
    text: inputText,
    timestamp: new Date(),
  };

  setMessages(prev => [
    ...prev,
    newUserMessage,
    {
      id: newUserMessage.id + 1,
      sender: 'ai',
      text: "…", // Optional: show loading
      timestamp: new Date(),
    }
  ]);
  setInputText("");
  setIsProcessing(true);

  try {
    const res = await fetch('/api/gen/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: inputText }),
    });

    const data = await res.json();
    // Extract the AI response from the JSON structure
    const aiText =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.delta?.content ||
      data.text ||
      "Sorry, I couldn't generate a response.";

    setMessages(prev => [
      ...prev.slice(0, -1),
      {
        ...prev[prev.length - 1],
        text: aiText,
      },
    ]);
  } catch (err: any) {
    setMessages(prev => [
      ...prev.slice(0, -1),
      {
        ...prev[prev.length - 1],
        text: `Sorry, there was an error generating a response.${err?.message ? " " + err.message : ""}`,
      },
    ]);
  } finally {
    setIsProcessing(false);
  }
};
