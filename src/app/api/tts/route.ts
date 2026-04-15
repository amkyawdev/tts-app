import { NextRequest, NextResponse } from "next/server";

// ElevenLabs API - Multi-language compatible voices
const VOICE_IDS: Record<string, { id: string; name: string }> = {
  young_female: { id: "pNInz6obpgDQGcFmaJgB", name: "Rachel - Young Female" },
  adult_female: { id: "21m00zcmjkR08jW9ClH", name: "Samantha - Adult Female" },
  male: { id: "CYJ3YCz3I7I7I7I7I", name: "Arnold - Adult Male" },
  horror: { id: "pNInz6obpgDQGcFmaJgB", name: "Rachel - Deep" },
};

// System prompt to guide the TTS for better Asian voice synthesis
const SYSTEM_PROMPTS: Record<string, string> = {
  young_female: "Speak in a young female voice with a soft, gentle tone appropriate for Burmese/Myanmar or Southeast Asian languages. Use a natural, conversational pace.",
  adult_female: "Speak in a mature adult female voice with a clear, professional tone appropriate for presentations. Maintain a steady pace suitable for Burmese/Myanmar or Southeast Asian languages.",
  male: "Speak in a deep male adult voice with a confident, authoritative tone. Use appropriate bass and gravitas for Burmese/Myanmar or Southeast Asian languages.",
  horror: "Speak in an eerie, dark tone with suspenseful pacing. Use unsettling inflection suitable for horror stories.",
};

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id = "young_female", mode = "normal" } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanedText = text.trim();
    
    if (cleanedText.length > 5000) {
      return NextResponse.json({ error: "Text exceeds 5000 chars" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Add ELEVENLABS_API_KEY in Vercel" }, { status: 503 });
    }

    const voiceConfig = VOICE_IDS[voice_id] || VOICE_IDS.young_female;
    const systemPrompt = SYSTEM_PROMPTS[voice_id] || SYSTEM_PROMPTS.young_female;

    // Optimize voice settings for Asian languages
    const voiceSettings = {
      stability: voice_id === "male" ? 0.3 : 0.5,
      similarity_boost: 0.85,  // Higher for more consistent voice character
      style: voice_id === "male" ? 0.5 : 0.3,  // Male gets more style variation
      use_speaker_boost: true,  // ElevenLabs v2 feature
    };

    // Build the text with system guidance
    const fullText = voice_id !== "normal" 
      ? `${systemPrompt}\n\n${cleanedText}`
      : cleanedText;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.id}`,
      {
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        method: "POST",
        body: JSON.stringify({
          text: fullText,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ElevenLabs error:", errorData);
      
      if (response.status === 429) {
        return NextResponse.json({ error: "Service busy. Try again." }, { status: 503 });
      }
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }
      return NextResponse.json({ error: "TTS failed" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
