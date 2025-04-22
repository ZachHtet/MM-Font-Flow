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
    <div className="flex justify-end items-center gap-4 mt-6 mb-6">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span className="text-sm">Settings:</span>
      </div>
      <Button 
        variant="outline" 
        onClick={onToggleEnglish}
        className={`text-sm h-8 ${englishMode ? 'btn-english-on' : 'btn-english-off'}`}
      >
        ENG: {englishMode ? "ON" : "OFF"}
      </Button>
      <Button 
        variant="outline" 
        onClick={onClearAll}
        className="text-sm h-8 btn-clear-all"
      >
        Clear All
      </Button>
    </div>
  );
} 