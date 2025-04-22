"use client";

import { useState, useEffect } from "react";
import Rabbit from "rabbit-node";
import { uni2win, win2uni } from "@/utils/win-converter";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { TextDisplay } from "@/components/text-display";
import { SettingsBar } from "@/components/settings-bar";
import { FAQSection } from "@/components/faq-section";
import UIImageUpload from "@/components/ui-image-upload";

export default function Home() {
  const [unicodeText, setUnicodeText] = useState("");
  const [zawgyiText, setZawgyiText] = useState("");
  const [winText, setWinText] = useState("");
  const [activeInput, setActiveInput] = useState("");
  const [englishMode, setEnglishMode] = useState(true);
  const { toast } = useToast();
  
  // Filter out English words from text
  const filterEnglishWords = (text: string) => {
    if (englishMode) return text;
    
    // Replace English words with dashes
    return text.replace(/\b[a-zA-Z]+\b/g, match => '-'.repeat(match.length));
  };
  
  // Remove English completely (for copying when English mode is OFF)
  const removeEnglishChars = (text: string) => {
    // First replace English words with a space
    const withSpaces = text.replace(/\b[a-zA-Z0-9]+\b/g, ' ');
    // Then clean up extra spaces
    return withSpaces.replace(/\s+/g, ' ').trim();
  };
  
  // Special function to handle Win text copying
  const processWinTextForCopy = (text: string) => {
    if (englishMode) return text;
    
    // For Win text, we need to preserve the important encoding characters
    // but remove any actual English words
    
    // This approach captures Myanmar-related characters and ignores the rest
    let myanmarOnly = '';
    let isEnglishSequence = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // Check if it's a Myanmar character or a special Win font character
      const isMyanmarChar = /[\u1000-\u109F]|[^a-zA-Z0-9\s]/.test(char);
      
      if (isMyanmarChar) {
        myanmarOnly += char;
        isEnglishSequence = false;
      } else if (char === ' ') {
        // Only add spaces if they're not part of an English sequence
        if (!isEnglishSequence && myanmarOnly.length > 0) {
          myanmarOnly += ' ';
        }
      } else {
        // It's an English character
        isEnglishSequence = true;
      }
    }
    
    // Clean up extra spaces
    return myanmarOnly.replace(/\s+/g, ' ').trim();
  };
  
  // Process display text (used for display only)
  const processTextForDisplay = (text: string) => {
    if (englishMode) return text;
    return filterEnglishWords(text);
  };
  
  // Re-process win text when english mode changes
  useEffect(() => {
    // Only update when we have unicode text
    if (unicodeText) {
      // If switching English mode, we need to regenerate Win text
      // from filtered or unfiltered Unicode
      const processed = englishMode ? unicodeText : filterEnglishWords(unicodeText);
      setWinText(uni2win(processed));
    }
  }, [englishMode, unicodeText]);

  // Handle text extraction from image
  const handleTextExtracted = (text: string) => {
    setUnicodeText(text);
    // Convert the extracted text (assuming it's unicode) to other formats
    setZawgyiText(Rabbit.uni2zg(text));
    
    // Apply English filtering before Win conversion if needed
    const processedText = englishMode ? text : filterEnglishWords(text);
    setWinText(uni2win(processedText));
    
    setActiveInput("unicode");
    
    // Show success toast for text extraction
    if (text && text.trim()) {
      toast({
        title: "Text Extracted Successfully",
        description: "Text has been extracted and converted to all formats.",
        variant: "success",
      });
    } else {
      toast({
        title: "No Text Detected",
        description: "No text was found in the image.",
        variant: "warning",
      });
    }
  };

  // Handle unicode input change
  const handleUnicodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setUnicodeText(newText);
    setActiveInput("unicode");
    
    // If text is deleted completely, clear all boxes
    if (!newText) {
      setZawgyiText("");
      setWinText("");
      return;
    }
    
    // Convert unicode to other formats
    setZawgyiText(Rabbit.uni2zg(newText));
    
    // Apply English filtering before Win conversion if needed
    const processedText = englishMode ? newText : filterEnglishWords(newText);
    setWinText(uni2win(processedText));
  };

  // Handle zawgyi input change
  const handleZawgyiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setZawgyiText(newText);
    setActiveInput("zawgyi");
    
    // If text is deleted completely, clear all boxes
    if (!newText) {
      setUnicodeText("");
      setWinText("");
      return;
    }
    
    // Convert zawgyi to Unicode
    const unicodeText = Rabbit.zg2uni(newText);
    setUnicodeText(unicodeText);
    
    // Apply English filtering before Win conversion if needed
    const processedText = englishMode ? unicodeText : filterEnglishWords(unicodeText);
    setWinText(uni2win(processedText));
  };

  // Handle win input change
  const handleWinChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setWinText(newText);
    setActiveInput("win");
    
    // If text is deleted completely, clear all boxes
    if (!newText) {
      setUnicodeText("");
      setZawgyiText("");
      return;
    }
    
    // Use win2uni conversion function
    const convertedUnicode = win2uni(newText);
    setUnicodeText(convertedUnicode);
    
    // Convert from Unicode to Zawgyi
    setZawgyiText(Rabbit.uni2zg(convertedUnicode));
  };

  // Handle copy text
  const handleCopy = async (text: string, fontType: string) => {
    // Check if text is empty or just whitespace
    if (!text || text.trim() === "") {
      console.log("Empty text - nothing to copy");
      
      toast({
        title: "Nothing to copy!",
        description: "Please enter some text first",
        variant: "warning",
      });
      
      return;
    }
    
    try {
      let textToCopy = text;
      
      // Only filter if English mode is OFF
      if (!englishMode) {
        // For Win text, just remove dashes but keep the rest
        if (fontType === "Win") {
          // Simple dash removal for Win text
          textToCopy = text.replace(/-/g, '');
        } else {
          // For Unicode and Zawgyi, remove English words
          textToCopy = removeEnglishChars(text);
        }
      }
      
      // Copy the processed text to clipboard
      await navigator.clipboard.writeText(textToCopy);
      
      // Show toast notification
      toast({
        title: "Copied!",
        description: `${fontType} text copied to clipboard${!englishMode ? ' (English filtered)' : ''}`,
        variant: "success",
      });
      
      // Show confetti
      try {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '9999';
        
        const myConfetti = confetti.create(canvas, {
          resize: true
        });
        
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6, x: 0.5 }
        });
        
        // Remove canvas after animation
        setTimeout(() => {
          document.body.removeChild(canvas);
        }, 2000);
      } catch (err) {
        console.error('Failed to show confetti:', err);
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
      
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "error",
      });
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    // Check if there's anything to clear
    const hasContent = !!(unicodeText.trim() || zawgyiText.trim() || winText.trim());
    
    // Clear all text fields
    setUnicodeText("");
    setZawgyiText("");
    setWinText("");
    setActiveInput("");
    
    // Only show notification if there was content to clear
    if (hasContent) {
      toast({
        title: "Cleared",
        description: "All text has been cleared.",
        variant: "default",
      });
    } else {
      toast({
        title: "Nothing to clear",
        description: "All text boxes are already empty.",
        variant: "default",
      });
    }
  };

  // Toggle English mode
  const handleToggleEnglish = () => {
    setEnglishMode(!englishMode);
    
    // Show toast to indicate mode change
    toast({
      title: `English words ${!englishMode ? 'visible' : 'hidden'}`,
      description: `English words are now ${!englishMode ? 'visible' : 'filtered (replaced with -)'} in all text boxes`,
      variant: "default",
    });
  };

  // Win placeholder with escaped quotes
  const winPlaceholder = "oD[dkVfrS OmPfBuD;&Sifonf tm,k0¹eaq;òef;pmudk ZvGefaps;ab; Am'Hyifxuf t\"d|mefvsuf *CePzwfcJhonf/";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="app-container">
          <HeroSection />
          
          <div className="w-full mb-16">
            {/* Image upload area */}
            <UIImageUpload onTextExtracted={handleTextExtracted} />
            
            {/* Settings bar */}
            <SettingsBar 
              onClearAll={handleClearAll} 
              englishMode={englishMode}
              onToggleEnglish={handleToggleEnglish}
            />
            
            {/* Text display areas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:grid-flow-row auto-rows-fr">
              <TextDisplay
                title="Unicode"
                text={unicodeText}
                displayText={processTextForDisplay(unicodeText)}
                onChange={handleUnicodeChange}
                onCopy={() => handleCopy(unicodeText, "Unicode")}
                fontClass="font-unicode"
                placeholder="သီဟိုဠ်မှ ဉာဏ်ကြီးရှင်သည် အာယုဝဍ္ဎနဆေးညွှန်းစာကို ဇလွန်ဈေးဘေး ဗာဒံပင်ထက် အဓိဋ္ဌာန်လျက် ဂဃနဏဖတ်ခဲ့သည်။"
              />
              
              <TextDisplay
                title="Zawgyi"
                text={zawgyiText}
                displayText={processTextForDisplay(zawgyiText)}
                onChange={handleZawgyiChange}
                onCopy={() => handleCopy(zawgyiText, "Zawgyi")}
                fontClass="font-zawgyi"
                placeholder="သီဟိုဠ္မွ ဉာဏ္ႀကီးရွင္သည္ အာယုဝၯနေဆးၫႊန္းစာကို ဇလြန္ေဈးေဘး ဗာဒံပင္ထက္ အဓိ႒ာန္လ်က္ ဂဃနဏဖတ္ခဲ့သည္။"
              />
              
              <TextDisplay
                title="Win"
                text={winText}
                displayText={winText}
                onChange={handleWinChange}
                onCopy={() => handleCopy(winText, "Win")}
                fontClass="font-win"
                placeholder={winPlaceholder}
              />
            </div>
          </div>
          
          <FAQSection />
        </div>
      </main>
    </div>
  );
}
