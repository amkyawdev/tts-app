"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Bell, User } from "lucide-react";

export default function Header() {
  const [isDark, setIsDark] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // Initialize dark mode from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    // Load word count
    const stored = localStorage.getItem("wordCount");
    const date = localStorage.getItem("wordCountDate");
    const today = new Date().toDateString();

    if (date === today && stored) {
      setWordCount(parseInt(stored, 10));
    } else {
      setWordCount(0);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="h-16 glass flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white">AmkyawDev TTS</h1>
        <p className="text-xs text-gray-400">
          {wordCount}/1800 words today
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Word count indicator */}
        <div className="hidden sm:block text-right">
          <p className="text-xs text-gray-400">Daily Limit</p>
          <div className="w-24 h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((wordCount / 1800) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User avatar */}
        <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
