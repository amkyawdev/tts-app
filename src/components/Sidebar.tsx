"use client";

import { useState } from "react";
import { 
  Home, 
  Mic, 
  BookOpen, 
  Settings, 
  Menu, 
  X,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Mic, label: "TTS", href: "/tts" },
  { icon: BookOpen, label: "Story", href: "/story" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full 
          glass dark:glass-dark z-50
          transition-all duration-300 flex flex-col
          ${isExpanded ? "w-56" : "w-16"}
          ${isExpanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isExpanded && (
            <span className="font-bold text-white whitespace-nowrap">
              TTS App
            </span>
          )}
        </div>

        {/* Toggle button (mobile) */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden absolute top-4 -right-12 w-10 h-10 glass rounded-r-xl flex items-center justify-center"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsExpanded(false)}
                className={`
                  mx-2 flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? "bg-purple-600/30 text-purple-300 shadow-lg shadow-purple-500/20" 
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-purple-400" : ""}`} />
                {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle (bottom) */}
        <div className="p-4 border-t border-white/10">
          {!isExpanded && (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
