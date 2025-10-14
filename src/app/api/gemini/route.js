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

    console.log("API Key exists, checking available models via REST API...");
    
    // First, let's try to get available models via direct REST API call
    try {
      const modelsResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        console.log("Available models from REST API:", modelsData);
        
        const availableModels = modelsData.models || [];
        const modelNames = availableModels.map(model => ({
          name: model.name,
          displayName: model.displayName,
          supportedGenerationMethods: model.supportedGenerationMethods
        }));
        
        // Try to find a working model
        const genAI = new GoogleGenerativeAI(apiKey);
        
        for (const modelInfo of availableModels) {
          if (modelInfo.supportedGenerationMethods && 
              modelInfo.supportedGenerationMethods.includes('generateContent')) {
            
            try {
              // Extract model name (remove 'models/' prefix if present)
              const modelName = modelInfo.name.replace('models/', '');
              console.log(`Testing available model: ${modelName}`);
              
              const model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent("Hello");
              const response = await result.response;
              const text = response.text();
              
              console.log(`SUCCESS with model: ${modelName}`);
              
              return NextResponse.json({ 
                success: true,
                keyExists: true,
                response: text,
                model: modelName,
                originalModelName: modelInfo.name,
                availableModels: modelNames,
                message: "API key is working!"
              });
              
            } catch (error) {
              console.log(`Model ${modelInfo.name} failed:`, error.message);
              continue;
            }
          }
        }
        
        return NextResponse.json({
          error: "No working models found",
          availableModels: modelNames,
          keyExists: true
        });
        
      } else {
        console.log("Models API call failed:", modelsResponse.status, modelsResponse.statusText);
      }
    } catch (restError) {
      console.log("REST API call failed:", restError.message);
    }
    
    // If REST API fails, try some basic model names
    console.log("Trying basic model names...");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const basicModels = [
      "gemini-1.5-flash",
      "gemini-pro",
      "text-bison-001",
      // Try without any prefix
      "gemini-1.5-flash-latest"
    ];

    let lastError = null;

    for (const modelName of basicModels) {
      try {
        console.log(`Testing basic model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.5
          }
        });
        
        const result = await model.generateContent("Hi");
        const response = await result.response;
        const text = response.text();
        
        console.log(`SUCCESS with basic model: ${modelName}`);
        
        return NextResponse.json({ 
          success: true,
          keyExists: true,
          response: text,
          model: modelName,
          message: "API key is working with basic model!"
        });
        
      } catch (error) {
        console.log(`Basic model ${modelName} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // If everything fails, return detailed error
    return NextResponse.json({
      error: lastError ? lastError.message : "All models failed",
      keyExists: true,
      details: "No working models found - API key might be restricted or region-locked"
    });
    
  } catch (error) {
    console.error("Complete failure:", error);
    
    return NextResponse.json({ 
      error: error.message,
      keyExists: !!process.env.GEMINI_API_KEY,
      details: "Complete API test failure"
    });
  }
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Quick help responses
    const helpKeywords = ['help', 'how to', 'what can you do', 'guide', 'assist'];
    const isAskingForHelp = helpKeywords.some(k => prompt.toLowerCase().includes(k));
    
    if (isAskingForHelp) {
      return NextResponse.json({
        response: "I can help with medicine info, interactions, symptoms, and health questions. What would you like to know?",
        timestamp: new Date().toISOString(),
        isHelpResponse: true
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        response: "API configuration error.",
        timestamp: new Date().toISOString(),
        error: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the most likely working models
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7
          }
        });

        const result = await model.generateContent(`Medical assistant: ${prompt}`);
        const response = await result.response;
        const text = response.text();
        
        if (!text) throw new Error("Empty response");

        return NextResponse.json({
          response: text,
          timestamp: new Date().toISOString(),
          model: modelName
        });

      } catch (error) {
        console.log(`POST: Model ${modelName} failed:`, error.message);
        continue;
      }
    }

    return NextResponse.json({
      response: "I'm temporarily unavailable. Please try again in a moment.",
      timestamp: new Date().toISOString(),
      error: true
    });

  } catch (error) {
    return NextResponse.json({
      response: "I'm having technical difficulties. Please try again later.",
      timestamp: new Date().toISOString(),
      error: true
    });
  }
}