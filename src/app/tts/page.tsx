"use client";

import { useState, useEffect } from "react";
import { Play, Square, Download, Volume2, AlertCircle, Check } from "lucide-react";
import { speak, voiceProfiles, getWordCount, addWordCount, DAILY_WORD_LIMIT } from "@/lib/tts";

export default function TTSPage() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(voiceProfiles[0].id);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setIsSpeaking(true);

    try {
      const profile = voiceProfiles.find((v) => v.id === selectedVoice) || voiceProfiles[0];
      await speak(text, profile);
      addWordCount(words);
      setWordCount((prev) => prev + words);
      setSuccess("Speech completed!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Failed to speak. Please try again.");
      console.error(e);
    }

    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
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
          Convert your text to natural voice using 4 different voice profiles
        </p>

        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Daily Usage</span>
            <span className={`font-bold ${wordCount >= DAILY_WORD_LIMIT ? "text-red-400" : "text-purple-400"}`}>
              {wordCount} / {DAILY_WORD_LIMIT} words
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                wordCount >= DAILY_WORD_LIMIT ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"
              }`}
              style={{ width: `${Math.min((wordCount / DAILY_WORD_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Voice Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {voiceProfiles.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-xl transition-all ${
                  selectedVoice === voice.id
                    ? "bg-purple-600/30 border-2 border-purple-500"
                    : "glass hover:bg-white/10"
                }`}
              >
                <Volume2 className={`w-6 h-6 mx-auto mb-2 ${
                  selectedVoice === voice.id ? "text-purple-400" : "text-gray-400"
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
            placeholder="Type or paste your text here..."
            className="w-full h-48 bg-black/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
              disabled={!text.trim() || wordCount >= DAILY_WORD_LIMIT}
              className="glass-button flex-1 flex items-center justify-center gap-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Speak
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="glass-button flex items-center justify-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}