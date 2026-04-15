import { NextRequest, NextResponse } from "next/server";

const VOICE_IDS: Record<string, { id: string; name: string }> = {
  young_female: { id: "pNInz6obpgDQGcFmaJgB", name: "Rachel" },
  adult_female: { id: "21m00zcmjkR08jW9ClH", name: "Samantha" },
  male: { id: "CYJ3YCz3I7I7I7I7I", name: "Arnold" },
  horror: { id: "pNInz6obpgDQGcFmaJgB", name: "Rachel" },
};

const SYSTEM_PROMPTS: Record<string, string> = {
  young_female: "Speak in a young female voice with a soft, gentle tone for Burmese/Myanmar. Natural pace.",
  adult_female: "Speak in a mature adult female voice with clear, professional tone.",
  male: "Speak in a deep male adult voice with confident, authoritative tone.",
  horror: "Speak in an eerie, dark tone with suspenseful pacing.",
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

    const voiceSettings = {
      stability: voice_id === "male" ? 0.3 : 0.5,
      similarity_boost: 0.85,
      style: voice_id === "male" ? 0.5 : 0.3,
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
