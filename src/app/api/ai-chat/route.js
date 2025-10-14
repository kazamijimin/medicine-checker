import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing API key...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "No API key found",
        keyExists: false 
      });
    }

    console.log("API Key exists, testing connection...");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ 
      success: true,
      keyExists: true,
      response: text,
      message: "API key is working!"
    });
    
  } catch (error) {
    console.error("Test failed:", error);
    
    return NextResponse.json({ 
      error: error.message,
      keyExists: !!process.env.GEMINI_API_KEY,
      details: "API key test failed"
    });
  }
}