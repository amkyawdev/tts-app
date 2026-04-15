"use client";

import { useEffect, useState, createContext, useContext } from "react";

// TTS Loading Context for global loading state
export const TTSLoadingContext = createContext({
  isLoading: false,
  setLoading: (loading: boolean) => {},
});

export const useTTSLoading = () => useContext(TTSLoadingContext);

export default function PWAProvider() {
  const [isLoading, setLoadingState] = useState(false);

  useEffect(() => {
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration);
          })
          .catch((error) => {
            console.log("SW registration failed:", error);
          });
      });
    }
  }, []);

  const setLoading = (loading: boolean) => {
    setLoadingState(loading);
  };

  return (
    <TTSLoadingContext.Provider value={{ isLoading, setLoading }}>
    </TTSLoadingContext.Provider>
  );
}