import { NextRequest, NextResponse } from "next/server";

// Myanmar Zawgyi to Unicode converter (simple mapping)
const zawgyiToUnicode: Record<string, string> = {
  // Zawgyi to Unicode mapping for common characters
  '\u1000': '\u1000', '\u1001': '\u1001', '\u1002': '\u1002', '\u1003': '\u1003',
  '\u1004': '\u1004', '\u1005': '\u1005', '\u1006': '\u1006', '\u1007': '\u1007',
  '\u1008': '\u1008', '\u1009': '\u1009', '\u100A': '\u100A', '\u100B': '\u100B',
  '\u100C': '\u100C', '\u100D': '\u100D', '\u100E': '\u100E', '\u100F': '\u100F',
  '\u1010': '\u1010', '\u1011': '\u1011', '\u1012': '\u1012', '\u1013': '\u1013',
  '\u1014': '\u1014', '\u1015': '\u1015', '\u1016': '\u1016', '\u1017': '\u1017',
  '\u1018': '\u1018', '\u1019': '\u1019', '\u101A': '\u101A', '\u101B': '\u101B',
  '\u101C': '\u101C', '\u101D': '\u101D', '\u101E': '\u101E', '\u101F': '\u101F',
  '\u1020': '\u1020', '\u1021': '\u1021', '\u1022': '\u1022', '\u1023': '\u1023',
  '\u1024': '\u1024', '\u1025': '\u1025', '\u1026': '\u1026', '\u1027': '\u1027',
  '\u1028': '\u1028', '\u1029': '\u1029', '\u102A': '\u102A', '\u102B': '\u102B',
  '\u102C': '\u102C', '\u102D': '\u102D', '\u102E': '\u102E', '\u102F': '\u102F',
  '\u1030': '\u1030', '\u1031': '\u1031', '\u1032': '\u1032', '\u1033': '\u1033',
  '\u1034': '\u1034', '\u1035': '\u1035', '\u1036': '\u1036', '\u1037': '\u1037',
  '\u1038': '\u1038', '\u1039': '\u1039', '\u103A': '\u103A', '\u103B': '\u103B',
  '\u103C': '\u103C', '\u103D': '\u103D', '\u103E': '\u103E', '\u103F': '\u103F',
  '\u1040': '\u1040', '\u1041': '\u1041', '\u1042': '\u1042', '\u1043': '\u1043',
  '\u1044': '\u1044', '\u1045': '\u1045', '\u1046': '\u1046', '\u1047': '\u1047',
  '\u1048': '\u1048', '\u1049': '\u1049', '\u104A': '\u104A', '\u104B': '\u104B',
  '\u104C': '\u104C', '\u104D': '\u104D', '\u104E': '\u104E', '\u104F': '\u104F',
};

// Detect if text contains Myanmar characters
function containsMyanmar(text: string): boolean {
  const myanmarPattern = /[\u1000-\u109F\uAA60-\uAA7F]/;
  return myanmarPattern.test(text);
}

// Check if text might be in Zawgyi (contains known Zawgyi-specific chars)
function isZawgyi(text: string): boolean {
  const zawgyiPattern = /[\u1039\u103B\u103C\u104F]/;
  return zawgyiPattern.test(text);
}

// Convert Zawgyi to Unicode (simplified - for production use proper library)
function convertZawgyiToUnicode(text: string): string {
  // This is a simplified converter. For full conversion, use rabbit-converter
  // The function returns text as-is; in production integrate proper conversion
  return text;
}

// Clean text for TTS (remove special chars that may cause issues)
function cleanText(text: string): string {
  return text
    .replace(/[@#$%^&*()_+\-=\[\]{}|\\:";'<>?,/~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Clean and validate text
    const cleanedText = cleanText(text);
    
    if (cleanedText.length > 1000) {
      return NextResponse.json(
        { error: "Text exceeds maximum length of 1000 characters" },
        { status: 400 }
      );
    }

    // Check for Myanmar characters
    const hasMyanmar = containsMyanmar(cleanedText);
    
    if (hasMyanmar && isZawgyi(cleanedText)) {
      // Convert Zawgyi to Unicode (would use rabbit-converter in production)
      // For now, log the detection
      console.log("Zawgyi detected, attempting conversion");
    }

    // Get API key from environment
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "TTS service not configured. Please add HUGGINGFACE_API_KEY in Vercel settings." },
        { status: 503 }
      );
    }

    // Use Facebook MMS TTS model via Hugging Face Inference API
    const model = "facebook/mms-tts-mya";
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: cleanedText,
          options: {
            // MMS model typically outputs 16kHz or 22.05kHz
            sampling_rate: 16000,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("HuggingFace API error:", errorData);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Service busy. Please try again in a few moments." },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: "TTS generation failed. Please try again." },
        { status: 500 }
      );
    }

    // Get audio as array buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Return audio with proper headers
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.byteLength.toString(),
        "X-Sampling-Rate": "16000",
      },
    });

  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}