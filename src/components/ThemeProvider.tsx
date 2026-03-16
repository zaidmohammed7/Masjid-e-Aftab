"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type FontSize = "small" | "medium" | "large";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedFontSize = localStorage.getItem("fontSize") as FontSize;

    const root = document.documentElement;

    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }
    
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      root.classList.remove("font-size-small", "font-size-medium", "font-size-large");
      root.classList.add(`font-size-${savedFontSize}`);
    } else {
      root.classList.add("font-size-medium");
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("fontSize", size);
    const root = document.documentElement;
    root.classList.remove("font-size-small", "font-size-medium", "font-size-large");
    root.classList.add(`font-size-${size}`);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, setFontSize }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
