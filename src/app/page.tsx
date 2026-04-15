"use client";

import { useState, useEffect } from "react";
import { Sparkles, Mic, BookOpen, Clock, ArrowRight } from "lucide-react";
import { speak, voiceProfiles } from "@/lib/tts";
import Link from "next/link";

export default function Home() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("wordCount");
    const date = localStorage.getItem("wordCountDate");
    const today = new Date().toDateString();

    if (date === today && stored) {
      setWordCount(parseInt(stored, 10));
    }
  }, []);

  const handleSpeak = async () => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speak(
        "Welcome to AmkyawDev TTS! Your AI-powered text to story and speech application. Start creating amazing stories today!",
        voiceProfiles[0]
      );
    } catch (e) {
      console.error("Speech error:", e);
    }
    setIsSpeaking(false);
  };

  const features = [
    {
      icon: Mic,
      title: "Text to Speech",
      description: "Convert your text to natural voice with 4 voice profiles",
      href: "/tts",
    },
    {
      icon: BookOpen,
      title: "Story Generator",
      description: "Create 3-part stories up to 200 words each",
      href: "/story",
    },
    {
      icon: Clock,
      title: "Daily Limit",
      description: "1800 words per day with automatic reset",
      href: "/tts",
    },
  ];

  return (
    <main className="min-h-screen p-6">
      {/* Hero Section */}
      <section className="glass-card p-8 mb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AmkyawDev TTS
            </h1>
          </div>
          
          <p className="text-gray-300 text-lg mb-6 max-w-xl">
            Transform your text into engaging stories with AI-powered speech synthesis. 
            Create, speak, and download your content instantly.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              className="glass-button flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/50"
            >
              <Mic className={`w-5 h-5 ${isSpeaking ? "animate-pulse" : ""}`} />
              {isSpeaking ? "Speaking..." : "Try Demo"}
            </button>
            
            <Link 
              href="/tts"
              className="glass-button flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Word Count Card */}
      <section className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Daily Usage</h2>
            <p className="text-gray-400">
              Track your daily word limit and usage
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-400">{wordCount}</p>
            <p className="text-gray-400">/ 1800 words</p>
          </div>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((wordCount / 1800) * 100, 100)}%` }}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link
              key={index}
              href={feature.href}
              className="glass-card p-6 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
