import { NextRequest, NextResponse } from "next/server";

// ElevenLabs API endpoint
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Voice IDs for ElevenLabs
const VOICE_IDS: Record<string, string> = {
  young_female: "pNInz6obpgDQGcFmaJgB",
  adult_female: "21m00zcmjkR08jW9ClH",
  male: "CYJ3YCz3I7I7I7I7I",
  horror: "pNInz6obpgDQGcFmaJgB",
};

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id = "young_female" } = await request.json();

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

    const voiceId = VOICE_IDS[voice_id] || VOICE_IDS.young_female;

    const response = await fetch(
      `${ELEVENLABS_API_URL}/${voiceId}`,
      {
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        method: "POST",
        body: JSON.stringify({
          text: cleanedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ElevenLabs error:", errorData);
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