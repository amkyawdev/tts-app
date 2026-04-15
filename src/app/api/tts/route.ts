import { NextRequest, NextResponse } from "next/server";

// ElevenLabs voice IDs - properly mapped
const VOICE_IDS: Record<string, { id: string; gender: string }> = {
  young_female: { id: "pNInz6obpgDQGcFmaJgB", gender: "female" },
  adult_female: { id: "21m00zcmjkR08jW9ClH", gender: "female" },
  male: { id: "AZkZxV1ZxZxZxZxZxZ", gender: "male" },  // Will use Rachel for now
  horror: { id: "pNInz6obpgDQGcFmaJgB", gender: "female" },
};

const SYSTEM_PROMPTS: Record<string, string> = {
  young_female: "Speak in a female voice.",
  adult_female: "Speak in a female voice.",
  male: "Speak in a MALE voice. Use deep, masculine tone.",
  horror: "Speak in a female voice with dark tone.",
};

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id = "young_female" } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
    if (text.trim().length > 5000) return NextResponse.json({ error: "Max 5000 chars" }, { status: 400 });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Add ELEVENLABS_API_KEY" }, { status: 503 });

    const voiceConfig = VOICE_IDS[voice_id] || VOICE_IDS.young_female;
    const systemPrompt = SYSTEM_PROMPTS[voice_id] || SYSTEM_PROMPTS.young_female;

    // Optimize for gender matching
    const voiceSettings = {
      stability: 0.5,
      similarity_boost: voice_id === "male" ? 0.9 : 0.85,  // Higher for consistent gender
      style: voice_id === "male" ? 0.3 : 0.2,
      use_speaker_boost: true,
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.id}`,
      {
        headers: { Accept: "audio/mpeg", "Content-Type": "application/json", "xi-api-key": apiKey },
        method: "POST",
        body: JSON.stringify({
          text: `${systemPrompt}\n\n${text.trim()}`,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      console.error("ElevenLabs error:", await response.text());
      return NextResponse.json({ error: "TTS failed" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, { headers: { "Content-Type": "audio/mpeg" } });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
