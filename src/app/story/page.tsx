"use client";

import { useState } from "react";
import { BookOpen, Play, Download, RefreshCw, Sparkles, AlertCircle, Check } from "lucide-react";
import { speak, voiceProfiles, getWordCount, addWordCount, DAILY_WORD_LIMIT } from "@/lib/tts";

interface StoryPart {
  title: string;
  content: string;
}

export default function StoryPage() {
  const [topic, setTopic] = useState("");
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(voiceProfiles[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePart, setActivePart] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateStory = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    const { count } = getWordCount();
    if (count >= DAILY_WORD_LIMIT) {
      setError("Daily limit reached!");
      return;
    }

    setError("");
    setIsGenerating(true);

    // Simulate AI story generation with predefined templates
    // In production, this would call Hugging Face API
    const templates = [
      {
        title: "Part 1: The Beginning",
        content: `Once upon a time, in a land far away, there was a ${topic}. Everyone in the kingdom knew about it, but few dared to approach. The legend said that whoever could master its power would gain eternal wisdom. Young adventurers from every corner gathered, hoping to be the first to unlock its secrets. The journey began at dawn, when the morning mist still covered the valleys.`
      },
      {
        title: "Part 2: The Challenge",
        content: `As our heroes ventured deeper into the unknown, they faced many trials. The path was filled with obstacles that tested their courage and wit. Some turned back, afraid of what lay ahead. But those who remained pressed on, driven by curiosity and determination. The biggest challenge awaited them at the heart of the forest - a riddle that had stumped countless seekers before.`
      },
      {
        title: "Part 3: The Resolution",
        content: `After months of hardship, the truth was finally revealed. The ${topic} was not just a myth, but a living testament to the power of perseverance. Our heroes learned that the real treasure was not the prize, but the journey itself. They returned as different people, carrying wisdom that would help their kingdom for generations. And so, a new legend was born - one that would inspire future adventurers for centuries to come.`
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setStoryParts(templates);
    addWordCount(180); // ~180 words total
    setIsGenerating(false);
    setSuccess("Story generated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSpeak = async (content: string) => {
    const index = storyParts.findIndex(p => p.content === content);
    setActivePart(index);
    
    try {
      const profile = voiceProfiles.find((v) => v.id === selectedVoice) || voiceProfiles[0];
      await speak(content, profile);
    } catch (e) {
      setError("Failed to speak");
    }
    setActivePart(null);
  };

  const handleDownload = (content: string, partIndex: number) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `story-part-${partIndex + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Story Generator</h1>
        <p className="text-gray-400 mb-6">
          Generate 3-part stories up to 200 words each
        </p>

        {/* Topic Input */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-lg font-semibold text-white mb-2">Story Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your story topic (e.g., 'a magical dragon')"
            className="w-full bg-black/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Voice Selection */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Narrator Voice</h2>
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
                <p className="font-medium text-white text-sm">{voice.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
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

        {/* Generate Button */}
        <button
          onClick={generateStory}
          disabled={isGenerating || !topic.trim()}
          className="glass-button w-full flex items-center justify-center gap-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:opacity-50 mb-8"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Story
            </>
          )}
        </button>

        {/* Story Parts */}
        {storyParts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Your Story</h2>
            {storyParts.map((part, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-400">{part.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSpeak(part.content)}
                      disabled={activePart !== null}
                      className="p-2 rounded-lg glass hover:bg-white/20"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(part.content, index)}
                      className="p-2 rounded-lg glass hover:bg-white/20"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{part.content}</p>
                <p className="text-gray-500 text-sm mt-4">
                  {part.content.split(/\s+/).length} words
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}