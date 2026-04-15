"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, Download, Volume2, AlertCircle, Check, Loader2 } from "lucide-react";
import { voiceProfiles, getWordCount, addWordCount, DAILY_WORD_LIMIT } from "@/lib/tts";

export default function TTSPage() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(voiceProfiles[0].id);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const { count } = getWordCount();
    setWordCount(count);
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    const words = text.trim().split(/\s+/).length;
    const remaining = DAILY_WORD_LIMIT - wordCount;

    if (words > remaining) {
      setError(`Daily limit exceeded. You have ${remaining} words remaining.`);
      return;
    }

    setError("");
    setIsApiLoading(true);
    setIsSpeaking(true);

    try {
      // Try API first (for Myanmar TTS with facebook/mms-tts-mya)
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // If API returns 503 or no API key, fall back to browser TTS
        if (response.status === 503 || data.error?.includes("not configured")) {
          await useBrowserTTS(text);
        } else {
          throw new Error(data.error || "Failed to generate speech");
        }
      } else {
        // Handle audio response from API
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
        
        addWordCount(words);
        setWordCount((prev) => prev + words);
        setSuccess("Speech completed!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e: any) {
      console.error("TTS error:", e);
      // Fall back to browser Web Speech API
      await useBrowserTTS(text);
    } finally {
      setIsApiLoading(false);
      setIsSpeaking(false);
    }
  };

  // Fallback to browser Web Speech API
  const useBrowserTTS = async (txt: string) => {
    if (!("speechSynthesis" in window)) {
      setError("Browser does not support text-to-speech");
      return;
    }

    const profile = voiceProfiles.find((v) => v.id === selectedVoice) || voiceProfiles[0];
    const utterance = new SpeechSynthesisUtterance(txt);
    
    // Try to find a Myanmar voice
    const voices = window.speechSynthesis.getVoices();
    const myanmarVoice = voices.find(v => v.lang.startsWith("my"));
    
    if (myanmarVoice) {
      utterance.voice = myanmarVoice;
    }
    
    utterance.lang = profile.lang;
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    utterance.onend = () => {
      addWordCount(txt.split(/\s+/).length);
      setWordCount((prev) => prev + txt.split(/\s+/).length);
      setSuccess("Speech completed!");
      setTimeout(() => setSuccess(""), 3000);
    };

    utterance.onerror = (e) => {
      setError("Failed to speak. Please try again.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsApiLoading(false);
  };

  const handleDownload = () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tts-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSuccess("Text downloaded!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Text to Speech</h1>
        <p className="text-gray-400 mb-6">
          Convert your text to natural voice using facebook/mms-tts-mya model
        </p>

        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />

        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Daily Usage</span>
            <span className={`font-bold ${wordCount >= DAILY_WORD_LIMIT ? "text-red-400" : "text-gray-400"}`}>
              {wordCount} / {DAILY_WORD_LIMIT} words
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                wordCount >= DAILY_WORD_LIMIT ? "bg-red-500" : "bg-gradient-to-r from-gray-500 to-gray-700"
              }`}
              style={{ width: `${Math.min((wordCount / DAILY_WORD_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Voice Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voiceProfiles.slice(0, 4).map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-xl transition-all ${
                  selectedVoice === voice.id
                    ? "bg-gray-600/30 border-2 border-gray-500"
                    : "glass hover:bg-white/10"
                }`}
              >
                <Volume2 className={`w-6 h-6 mx-auto mb-2 ${
                  selectedVoice === voice.id ? "text-gray-400" : "text-gray-400"
                }`} />
                <p className="font-medium text-white text-sm">{voice.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <label className="block text-lg font-semibold text-white mb-2">Enter Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text in Myanmar Unicode or English..."
            className="w-full h-48 bg-black/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
          />
          <p className="text-gray-500 text-sm mt-2">
            {text.trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="glass-card p-4 mb-6 flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="flex gap-4">
          {isSpeaking ? (
            <button
              onClick={handleStop}
              className="glass-button flex-1 flex items-center justify-center gap-2 bg-red-600/30 hover:bg-red-600/50"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleSpeak}
              disabled={!text.trim() || wordCount >= DAILY_WORD_LIMIT || isApiLoading}
              className="glass-button flex-1 flex items-center justify-center gap-2 bg-gray-600/30 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApiLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Speak
                </>
              )}
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="glass-button flex items-center justify-center gap-2 bg-gray-900/30 hover:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
