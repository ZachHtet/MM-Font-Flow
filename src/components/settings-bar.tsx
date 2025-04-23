"use client";

import { Button } from "./ui/button";
import { Settings } from "lucide-react";

interface SettingsBarProps {
  onClearAll: () => void;
  englishMode: boolean;
  onToggleEnglish: () => void;
}

export function SettingsBar({ onClearAll, englishMode, onToggleEnglish }: SettingsBarProps) {
  return (
    <div className="flex justify-end items-center gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6 mb-4 sm:mb-5 md:mb-6">
      <div className="flex items-center gap-1 sm:gap-2">
        <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="text-xs sm:text-sm">Settings:</span>
      </div>
      <Button 
        variant="outline" 
        onClick={onToggleEnglish}
        className={`text-xs sm:text-sm h-7 sm:h-8 ${englishMode ? 'btn-english-on' : 'btn-english-off'}`}
      >
        ENG: {englishMode ? "ON" : "OFF"}
      </Button>
      <Button 
        variant="outline" 
        onClick={onClearAll}
        className="text-xs sm:text-sm h-7 sm:h-8 btn-clear-all"
      >
        Clear All
      </Button>
    </div>
  );
}