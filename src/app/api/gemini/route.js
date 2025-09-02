import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt, context, concise = true, maxOutputTokens } = await request.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const helpKeywords = ['help', 'how to', 'what can you do', 'guide', 'assist', 'support', 'instructions', 'tutorial', 'what are you', 'who are you'];
    const isAskingForHelp = helpKeywords.some(k => prompt.toLowerCase().includes(k));
    if (isAskingForHelp) {
      return NextResponse.json({
        response: "I can help with medicine info, interactions, symptoms, nearby pharmacies, and app tips. Ask a question to begin.",
        timestamp: new Date().toISOString(),
        isHelpResponse: true
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const generationConfig = {
      maxOutputTokens: typeof maxOutputTokens === "number"
        ? Math.max(64, Math.min(maxOutputTokens, 256))
        : (concise ? 180 : 400),
      temperature: 0.7,
    };
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });

    const style = "Be concise. Use 3–5 short sentences or tight bullet points. Start with the direct answer. No fluff.";
    const enhancedPrompt = `${style}\n\nUser: ${prompt}\n${context ? `Context: ${context}` : ""}`.trim();

    const result = await model.generateContent(enhancedPrompt);
    const text = (await result.response).text();

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: { maxOutputTokens: 180, temperature: 0.7 }
      });

      const fallbackPrompt = "Be concise (3–5 short sentences). If needed, use short bullet points.";
      const result = await model.generateContent(fallbackPrompt);
      const text = (await result.response).text();

      return NextResponse.json({
        response: text,
        timestamp: new Date().toISOString(),
        model: "gemini-1.5-pro"
      });
    } catch {
      return NextResponse.json({
        response: "I’m having trouble answering right now. Please try again.",
        timestamp: new Date().toISOString(),
        error: true
      }, { status: 200 });
    }
  }
}