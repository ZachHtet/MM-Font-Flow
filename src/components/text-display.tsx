"use client";

import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface TextDisplayProps {
  title: string;
  text: string;
  displayText?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCopy: () => void;
  fontClass: string;
  placeholder?: string;
}

export function TextDisplay({
  title,
  text,
  displayText,
  onChange,
  onCopy,
  fontClass,
  placeholder = ""
}: TextDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);

  const textToDisplay = isEditing ? text : (displayText !== undefined ? displayText : text);

  const handleFocus = () => setIsEditing(true);
  const handleBlur = () => setIsEditing(false);

  return (
    <div className="flex flex-col h-full min-w-[360px] w-full">
      <div className="mb-4">
        <label className="font-medium">{title}</label>
      </div>
      <div className="flex-grow">
        <textarea
          value={textToDisplay}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full rounded-md border border-border bg-card/50 p-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${fontClass}`}
          style={{ resize: 'vertical', minHeight: '240px' }}
        />
        <Button 
          onClick={onCopy} 
          variant="outline" 
          className="mt-4 w-full flex items-center justify-center gap-2 py-6 transition-all duration-200"
        >
          <Copy className="h-5 w-5 copy-icon" />
          <span>Copy</span>
        </Button>
      </div>
    </div>
  );
}