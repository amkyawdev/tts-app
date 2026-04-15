"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Info, ExternalLink } from "lucide-react";
import { DAILY_WORD_LIMIT, resetWordCount, getWordCount } from "@/lib/tts";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const { count } = getWordCount();
    setWordCount(count);
    
    // Load saved API key
    const savedKey = localStorage.getItem("huggingface_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("huggingface_api_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetDaily = () => {
    if (confirm("Are you sure you want to reset your daily word count?")) {
      resetWordCount();
      setWordCount(0);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-6">
          Configure your TTS application
        </p>

        {/* API Key Configuration */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">API Configuration</h2>
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">
            Enter your Hugging Face API key to enable advanced TTS features. 
            Get your free token from Hugging Face.
          </p>

          <div className="flex gap-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Hugging Face API Key"
              className="flex-1 bg-black/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSaveApiKey}
              className="glass-button flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/50"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
          </div>

          {saved && (
            <p className="text-green-400 text-sm mt-2">
              API key saved successfully!
            </p>
          )}
        </div>

        {/* Daily Usage */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Usage</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300">Words used today</p>
              <p className="text-3xl font-bold text-purple-400">{wordCount}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Daily limit</p>
              <p className="text-xl text-gray-400">/ {DAILY_WORD_LIMIT}</p>
            </div>
          </div>

          <button
            onClick={handleResetDaily}
            className="glass-button w-full flex items-center justify-center gap-2 bg-red-600/30 hover:bg-red-600/50"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Daily Count
          </button>
        </div>

        {/* About */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">About</h2>
          </div>
          
          <div className="space-y-2 text-gray-400 text-sm">
            <p><strong className="text-white">AmkyawDev TTS</strong> v1.0.0</p>
            <p>A modern Text-to-Speech and Story Generator application</p>
            <p>Built with Next.js 14, Tailwind CSS, and Web Speech API</p>
            <p className="pt-2">
              <strong className="text-white">Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>4 Voice Profiles (Young Female, Adult Female, Male, Horror)</li>
              <li>3-Part Story Generation (200 words each)</li>
              <li>Daily 1800 word limit with LocalStorage tracking</li>
              <li>PWA support for Home Screen installation</li>
              <li>Glassmorphism UI with Dark/Light mode</li>
            </ul>
          </div>
        </div>

        {/* PWA Install Instructions */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Install as App</h2>
          <p className="text-gray-400 text-sm mb-4">
            Add this app to your Home Screen for quick access:
          </p>
          <ul className="list-disc list-inside text-gray-300 text-sm space-y-2">
            <li><strong className="text-white">iOS (Safari):</strong> Tap Share → Add to Home Screen</li>
            <li><strong className="text-white">Android (Chrome):</strong> Tap Menu → Install App</li>
            <li><strong className="text-white">Desktop:</strong> Look for install icon in address bar</li>
          </ul>
        </div>
      </div>
    </main>
  );
}