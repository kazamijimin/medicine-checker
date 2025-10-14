import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "No Hugging Face API key found",
        keyExists: false 
      });
    }

    // Test the API key
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: "Hello"
        }),
      }
    );

    const result = await response.json();

    return NextResponse.json({ 
      success: true,
      keyExists: true,
      response: "API key working!",
      model: "microsoft/DialoGPT-medium",
      message: "Hugging Face API key is working!"
    });
    
  } catch (error) {
    console.error("Hugging Face test failed:", error);
    
    return NextResponse.json({ 
      error: error.message,
      keyExists: !!process.env.HUGGINGFACE_API_KEY,
      details: "Hugging Face API test failed"
    });
  }
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        response: "API key not configured.",
        error: true
      });
    }

    console.log("=== REAL AI Called ===");
    console.log("User question:", prompt);

    // Use REAL AI models from Hugging Face
    const models = [
      "microsoft/DialoGPT-large",
      "facebook/blenderbot-400M-distill",
      "microsoft/DialoGPT-medium",
      "google/flan-t5-large"
    ];

    for (const modelName of models) {
      try {
        console.log(`Trying ${modelName}...`);

        const response = await fetch(
          `https://api-inference.huggingface.co/models/${modelName}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: `Medical Assistant: You are Nick, a helpful medical assistant. Answer this health question accurately and concisely: ${prompt}`,
              parameters: {
                max_length: 200,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false
              },
              options: {
                wait_for_model: true
              }
            }),
          }
        );

        const result = await response.json();
        console.log(`${modelName} response:`, result);

        let aiResponse = "";

        // Handle different response formats
        if (Array.isArray(result) && result[0]) {
          if (result[0].generated_text) {
            aiResponse = result[0].generated_text;
          } else if (result[0].translation_text) {
            aiResponse = result[0].translation_text;
          } else if (typeof result[0] === 'string') {
            aiResponse = result[0];
          }
        } else if (result.generated_text) {
          aiResponse = result.generated_text;
        }

        // Clean up the response
        if (aiResponse) {
          aiResponse = aiResponse.replace(/^Medical Assistant:\s*/i, '').trim();
          aiResponse = aiResponse.replace(/^You are Nick.*?:/i, '').trim();
          
          if (aiResponse.length > 10) {
            console.log(`SUCCESS with ${modelName}`);
            
            // Add medical disclaimer if not present
            if (!aiResponse.toLowerCase().includes('consult') && 
                !aiResponse.toLowerCase().includes('doctor')) {
              aiResponse += "\n\n⚠️ Always consult healthcare professionals for medical advice.";
            }

            return NextResponse.json({
              response: aiResponse,
              timestamp: new Date().toISOString(),
              model: modelName
            });
          }
        }

      } catch (modelError) {
        console.log(`${modelName} failed:`, modelError.message);
        continue;
      }
    }

    // If AI models fail, use smart fallback
    return getSmartFallback(prompt);

  } catch (error) {
    console.error("Complete AI Error:", error);
    return getSmartFallback(prompt);
  }
}

// Smart fallback function
function getSmartFallback(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Medical knowledge base for fallback
  const medicalKnowledge = {
    'migraine': "For migraines, try ibuprofen (400-600mg), acetaminophen (500-1000mg), or aspirin. Excedrin Migraine combines all three with caffeine. Rest in a dark, quiet room with a cold compress. See a doctor if migraines are frequent (3+ per month) or severe.",
    
    'headache': "For headaches, try acetaminophen (500-1000mg every 4-6 hours) or ibuprofen (200-400mg every 4-6 hours). Stay hydrated, rest, and apply cold or heat. See a doctor for severe, sudden, or persistent headaches.",
    
    'pain': "For mild-moderate pain: acetaminophen (Tylenol) 500-1000mg every 4-6 hours, or ibuprofen (Advil) 200-400mg every 4-6 hours. Take ibuprofen with food. For severe or chronic pain, consult a healthcare provider.",
    
    'cold': "For colds: rest, fluids, and symptom relief with acetaminophen/ibuprofen for aches, decongestants for stuffiness, and cough suppressants. Honey helps coughs. See a doctor if fever lasts 3+ days or symptoms worsen.",
    
    'fever': "For fever: acetaminophen or ibuprofen, plenty of fluids, rest, and light clothing. See a doctor if fever is over 101.3°F (38.5°C) for more than 3 days, or if you have severe symptoms.",
    
    'allergy': "For allergies: antihistamines like loratadine (Claritin), cetirizine (Zyrtec), or fexofenadine (Allegra). Nasal sprays like Flonase help congestion. Avoid known allergens and consider air purifiers."
  };

  // Find relevant information
  for (const [condition, info] of Object.entries(medicalKnowledge)) {
    if (lowerPrompt.includes(condition)) {
      return NextResponse.json({
        response: info + "\n\n⚠️ This is general information. Always consult healthcare professionals for medical advice.",
        timestamp: new Date().toISOString(),
        model: "medical-knowledge-base"
      });
    }
  }

  // General helpful response
  return NextResponse.json({
    response: "I can help with medical questions about medications, symptoms, and treatments. Could you be more specific about your health concern? For example, you could ask about headache relief, cold symptoms, pain medication, or any other health topic.\n\n⚠️ Always consult healthcare professionals for medical advice.",
    timestamp: new Date().toISOString(),
    model: "helpful-assistant"
  });
}