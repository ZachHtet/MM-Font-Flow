"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Check for user preference in localStorage first
    const storedTheme = localStorage.getItem("theme");
    
    if (storedTheme === "light") {
      setIsDarkTheme(false);
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = ""; // Reset to default
    } else if (storedTheme === "dark") {
      setIsDarkTheme(true);
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#121212"; // Dark background
    } else {
      // Check system preference if no stored preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
      
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.body.style.backgroundColor = "#121212"; // Dark background
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.body.style.backgroundColor = ""; // Reset to default
      }
    }
    
    // Apply theme immediately to avoid flicker
    document.documentElement.style.visibility = 'visible';
  }, []);

  const toggleTheme = () => {
    if (isDarkTheme) {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = ""; // Reset to default
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#121212"; // Dark background
      localStorage.setItem("theme", "dark");
    }
    setIsDarkTheme(!isDarkTheme);
  };

  // Rest of the component remains the same
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className={`
        theme-toggle-btn
        h-10 w-10 rounded-full 
        transition-all duration-200 ease-in-out
        ${isDarkTheme 
          ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-gray-600' 
          : 'bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300'
        }
        border-2
        hover:scale-110
        active:scale-95
        [&>svg]:text-[#D96E4B] hover:[&>svg]:text-[#D96E4B]
      `}
    >
      {isDarkTheme ? (
        <Sun className="h-5 w-5 transition-transform duration-200 rotate-0 hover:rotate-90 !text-[#D96E4B]" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-200 rotate-0 hover:-rotate-90 !text-[#D96E4B]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}