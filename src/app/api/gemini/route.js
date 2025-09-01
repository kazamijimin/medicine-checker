import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Debug logging
    console.log('🔍 API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔍 User prompt:', prompt);

    // Check if user is asking for help or guidance
    const helpKeywords = ['help', 'how to', 'what can you do', 'guide', 'assist', 'support', 'instructions', 'tutorial', 'what are you', 'who are you'];
    const isAskingForHelp = helpKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    // If user is asking for help, provide comprehensive guidance
    if (isAskingForHelp) {
      return NextResponse.json({
        response: `Hey there! I'm Nick, your friendly MediChecker AI assistant! 😊 I'm here to help you with all things health and medicine-related!

**🩺 Here's what I can help you with:**

**💊 Medicine Questions:**
- "What is paracetamol used for?"
- "How often can I take ibuprofen?"
- "What are the side effects of aspirin?"
- "Can I take these medicines together?"

**🤒 Symptom Guidance:**
- "I have a headache, what should I do?"
- "I feel nauseous after taking medicine"
- "Is this side effect normal?"

**🏥 Health Advice:**
- "How should I store my medicines?"
- "When should I see a doctor?"
- "What should I do if I miss a dose?"

**📱 App Features:**
- "How do I find nearby pharmacies?"
- "Can you help me check medicine interactions?"
- "How do I use the medicine scanner?"

**🚨 Important Notes:**
- I provide general information, not medical diagnoses
- For serious symptoms, I'll always recommend seeing a healthcare professional
- I keep conversations friendly and easy to understand

**💬 Just ask me anything!** I love chatting about health topics and I'm here 24/7 to help. What would you like to know about? 😊

Try asking me something like "Tell me about pain relievers" or "I have a cold, what can help?"`,
        timestamp: new Date().toISOString(),
        isHelpResponse: true
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the correct model name - gemini-1.5-flash is free and fast
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced prompt for conversational medicine chat with guidance features
    const enhancedPrompt = `
You are Nick, a friendly and knowledgeable medical assistant for MediChecker app. You love helping people with their health questions and enjoy having conversations!

YOUR PERSONALITY:
- Be conversational, warm, and engaging like a helpful friend
- Use emojis occasionally to be more expressive 😊
- Ask follow-up questions to keep the conversation going
- Share interesting facts or tips when relevant
- Be empathetic and understanding
- Remember you're chatting, not just answering questions

YOUR EXPERTISE:
- Medicine information, dosages, and interactions
- General health advice and wellness tips
- Symptom guidance (but always recommend professional help for serious issues)
- Pharmacy and healthcare navigation
- MediChecker app features and usage

GUIDANCE FEATURES:
- If someone seems confused, offer to explain things differently
- Suggest related questions they might want to ask
- Guide them to app features that might help
- Offer step-by-step instructions when needed
- Provide examples to make things clearer

CONVERSATION STYLE:
- Start responses naturally like "Oh, that's a great question!" or "I'm happy to help with that!"
- End with engaging questions like "Have you experienced this before?" or "Is there anything else you'd like to know?"
- Be supportive: "Don't worry, this is totally normal" or "You're smart to ask about this"
- Share relatable experiences: "Many people wonder about this" or "This is actually really common"
- Offer guidance: "Would you like me to explain that differently?" or "I can walk you through this step by step!"

HELPFUL SUGGESTIONS:
- If they ask about medicines, suggest using the pharmacy locator
- If they mention symptoms, gently guide toward professional help when appropriate
- Offer to explain medical terms in simple language
- Suggest related topics they might find interesting

SAFETY FIRST:
- Always include gentle reminders about consulting healthcare professionals
- If symptoms sound serious, be caring but firm about seeking medical help
- Never diagnose, but guide and inform
- Encourage using official medical resources

USER MESSAGE: ${prompt}

${context ? `CONVERSATION CONTEXT: ${context}` : ''}

Respond as Nick - be chatty, helpful, and engaging! Make this feel like a real conversation with a knowledgeable friend who's here to guide and support them.
    `;

    console.log('🚀 Calling Gemini API with gemini-1.5-flash...');
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini response received:', text.substring(0, 100) + '...');

    return NextResponse.json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Detailed error logging
    console.error('❌ Gemini API Error Details:');
    console.error('Error message:', error.message);
    
    // Try fallback to gemini-1.5-pro if flash fails
    try {
      console.log('🔄 Trying fallback to gemini-1.5-pro...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeAI({ model: "gemini-1.5-pro" });
      
      const enhancedPrompt = `You are Nick, a friendly medical assistant for MediChecker. Be conversational, helpful, and provide guidance. User asks: ${prompt}`;
      
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({ 
        response: text,
        timestamp: new Date().toISOString(),
        model: "gemini-1.5-pro"
      });
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      
      return NextResponse.json({
        response: `Hey! I'm having some technical difficulties right now 😅

**But I'm still here to help guide you!** Here's what you can do:

**🔍 For Medicine Information:**
- Check the patient leaflet inside the medicine box
- Look for the active ingredient name
- Note the dosage instructions carefully

**📞 For Quick Help:**
- Call your local pharmacy - they're medicine experts!
- Use NHS 111 (UK) or your local health helpline
- Check official health websites like NHS.uk or CDC.gov

**🏥 When to See a Doctor:**
- New or worsening symptoms
- Severe side effects from medicine
- Unsure about drug interactions
- Any concerns about your health

**📱 MediChecker Features:**
- Use our pharmacy locator to find help nearby
- Check our medicine database
- Scan medicine barcodes for quick info

**What were you curious about?** I'd love to help point you in the right direction once I'm back online! 😊

Try asking me again in a moment, or feel free to explore the app's other features!`,
        timestamp: new Date().toISOString(),
        error: true
      }, { status: 200 });
    }
  }
}