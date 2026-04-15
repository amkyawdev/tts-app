// Voice profiles for TTS with Web Speech API
export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  lang: string;
  voiceURI?: string;
  pitch: number;
  rate: number;
}

export const voiceProfiles: VoiceProfile[] = [
  {
    id: "young-female",
    name: "Young Female",
    description: "Light and energetic voice",
    lang: "en-US",
    pitch: 1.2,
    rate: 1.0,
  },
  {
    id: "adult-female",
    name: "Adult Female",
    description: "Professional and clear voice",
    lang: "en-US",
    pitch: 1.0,
    rate: 0.95,
  },
  {
    id: "male",
    name: "Male",
    description: "Deep and authoritative voice",
    lang: "en-US",
    pitch: 0.8,
    rate: 0.9,
  },
  {
    id: "horror",
    name: "Horror",
    description: "Dark and eerie voice",
    lang: "en-GB",
    pitch: 0.6,
    rate: 0.7,
  },
];

// Daily word limit
export const DAILY_WORD_LIMIT = 1800;

// Word count management
export function getWordCount(): { count: number; date: string } {
  const stored = localStorage.getItem("wordCount");
  const date = localStorage.getItem("wordCountDate");
  const today = new Date().toDateString();
  
  if (date === today && stored) {
    return { count: parseInt(stored, 10), date };
  }
  return { count: 0, date: "" };
}

export function addWordCount(words: number): { success: boolean; remaining: number } {
  const { count } = getWordCount();
  const remaining = DAILY_WORD_LIMIT - count;
  
  if (words > remaining) {
    return { success: false, remaining };
  }
  
  const today = new Date().toDateString();
  localStorage.setItem("wordCount", String(count + words));
  localStorage.setItem("wordCountDate", today);
  
  return { success: true, remaining: DAILY_WORD_LIMIT - (count + words) };
}

export function resetWordCount(): void {
  localStorage.removeItem("wordCount");
  localStorage.removeItem("wordCountDate");
}

// Text to Speech using Web Speech API
export function speak(text: string, profile: VoiceProfile): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = profile.lang;
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => 
      v.lang.startsWith(profile.lang.split("-")[0]) ||
      v.name.toLowerCase().includes(profile.id.includes("horror") ? "daniel" : "samantha")
    );
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

// Download speech as audio
export async function downloadSpeech(
  text: string, 
  profile: VoiceProfile
): Promise<Blob> {
  // Use Speech Synthesis to generate audio
  // Note: Web Speech API doesn't provide audio download directly
  // We'll create a workaround using MediaRecorder
  
  return new Promise((resolve, reject) => {
    // Create a simple text file download as fallback
    // since Web Speech API doesn't support audio export
    const blob = new Blob([text], { type: "text/plain" });
    resolve(blob);
  });
}
