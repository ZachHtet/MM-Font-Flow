// Constants shared across multiple functions
const DOUBLE_COUNTERS = ["က", "ဃ", "ဆ", "ည", "ဏ", "တ", "ထ", "ဘ", "ယ", "လ", "သ", "ဟ", "အ"];
const TOP_EXTENSIONS = ["ံ", "ိ", "ီ", "ဲ"];

// Function to reorder င်္ with adjacent characters
export function reorderNgaThet(text: string): string {
  try {
    return text.replace(/(င်္)([\u1000-\u109F])/g, (_, ngaThet, nextChar) => nextChar + ngaThet);
  } catch (error) {
    console.error("Error in reorderNgaThet:", error);
    return text; // Return original text in case of error
  }
}

// Function to handle Out Ka Myint (့) character with different outputs based on context
export function handleOutKaMyint(text: string): string {
  console.log("Input text to handleOutKaMyint:", text);
  
  let result = text;
  
  // 1. First handle the character conversions we know are working
  
  // Special case 1: Handle ရ + extensions + Out Ka Myint
  result = result.replace(/(ရ)((?:[ွှေိီဲံုူျြ]|္[က-အ])+)(့)/g, (_, ra, extensions) => 
    ra + extensions + "U"
  );
  
  // Simple case for ရ + Out Ka Myint
  result = result.replace(/(ရ)(့)/g, (_, ra) => ra + "U");
  
  // Special case 2: Handle န + extensions + Out Ka Myint
  result = result.replace(/(န)((?:[ွှေိီဲံုူျြ]|္[က-အ])+)(့)/g, (_, na, extensions) => 
    na + extensions + "Y"
  );
  
  // Simple case for န + Out Ka Myint
  result = result.replace(/(န)(့)/g, (_, na) => na + "Y");
  
  // Special case 3: Handle E (uppercase e - processed န character) + extensions + Out Ka Myint
  result = result.replace(/(E)((?:[ွှေိီဲံုူျြ]|္[က-အ])*)(့)/g, (_, e, extensions) => 
    e + extensions + "U"
  );
  
  // Simple case for E + Out Ka Myint
  result = result.replace(/(E)(့)/g, (_, e) => e + "Y");
  
  // 2. Now directly handle the problematic patterns
  
  // This matches patterns like ကိို့ or any combination of ု with other extensions
  result = result.replace(/([က-ဍဎဏတ-ဝသ-အ])([ိီဲံေ]*)?(ု)([ိီဲံေ]*)?(့)/g, (_, consonant, extBefore, taChaungNgin, extAfter) => 
    consonant + (extBefore || "") + taChaungNgin + (extAfter || "") + "Y"
  );
  
  // Double-story characters + Out Ka Myint -> use U
  result = result.replace(/([က-အ]္[က-အ])(့)/g, (_, doubleStory) => doubleStory + "U");
  
  // Ya Pint already processed (with 's' character) + Out Ka Myint -> use U
  result = result.replace(/((?:[က-အ])?s[dDJHklKL]*)?(့)/g, (match, processedYaPint) => {
    if (processedYaPint) {
      console.log("Matched processed Ya Pint:", match, "->", processedYaPint + "U");
      return processedYaPint + "U";
    }
    return match; // Let other patterns handle this
  });
  
  // Ya Yit already processed (all 4 variations: B, M, N, j) + Out Ka Myint -> use U
  result = result.replace(/((?:B|M|N|j)[a-zA-Z0-9'"[,*]*)(့)/g, (_, processedYaYit) => 
    processedYaYit + "U"
  );
  
  // Double story characters already processed + Out Ka Myint -> use U
  result = result.replace(/([åö°¦´©®¾ÆÇÖÜæéF·][a-zA-Z0-9KL]*)(့)/g, (_, processedDoubleStory) => 
    processedDoubleStory + "U"
  );
  
  // Ya Pint (ျ) + Out Ka Myint -> use U
  result = result.replace(/([က-အ])(ျ)(့)/g, (_, consonant, yaPint) => 
    consonant + yaPint + "U"
  );
  
  // Ya Pint + extensions - handle these explicitly
  result = result.replace(/([က-အ])(ျ)([ိီဲံုူွှေ]+)(့)/g, (_, consonant, yaPint, extensions) => 
    consonant + yaPint + extensions + "U"
  );
  
  // Wa-swe (ွ) + Out Ka Myint -> use U (except န which is handled above)
  result = result.replace(/([က-ဍဎဏတ-နပ-ရလဝသ-အ])(ွ|ွှ)(့)/g, (_, consonant, waSwe) => 
    consonant + waSwe + "U"
  );
  
  // Long U (ူ) + Out Ka Myint -> use U (except န which is handled above)
  result = result.replace(/([က-ဍဎဏတ-နပ-ရလဝသ-အ])(ူ)(့)/g, (_, consonant, longU) => 
    consonant + longU + "U"
  );
  
  // Hat Htoe (ှ) + Out Ka Myint -> use Y (except န, ရ which are handled above)
  result = result.replace(/([က-ဍဎဏတ-ဝသ-အ])(ှ)(့)/g, (_, consonant, hatHtoe) => 
    consonant + hatHtoe + "Y"
  );
  
  // Hat Htoe (ှ) + extensions + Out Ka Myint -> use Y
  result = result.replace(/([က-ဍဎဏတ-ဝသ-အ])(ှ)([ိီဲံု])(့)/g, (_, consonant, hatHtoe, extension) => 
    consonant + hatHtoe + extension + "Y"
  );
  
  // Default case: replace all remaining Out Ka Myint with 'h'
  result = result.replace(/(့)/g, () => "h");

  console.log("Final result from handleOutKaMyint:", result);
  return result;
}

// Function to handle Ya Pint with U vowels and extensions
export function handleYaPint(text: string): string {
  let result = text;
  
  // Special case: Ya Pint + Wa Swel + Hat Htoe
  result = result.replace(/(ျ)(ွှ)/g, () => "W");
  
  // Special case: Ya Pint + Wa Swel
  result = result.replace(/(ျ)(ွ)/g, () => "R");
  
  // Most specific: Ya Pint with top extension AND ု/ူ
  // Handle both orders: extension+vowel and vowel+extension
  result = result.replace(
    new RegExp(`(ျ)([${TOP_EXTENSIONS.join("")}])(ု|ူ)|(ျ)(ု|ူ)([${TOP_EXTENSIONS.join("")}])`, 'g'), 
    (_, yaPint1, extension1, uVowel1, yaPint2, uVowel2, extension2) => {
      const extension = extension1 || extension2;
      const uVowel = uVowel1 || uVowel2;
      
      const winExtension = unicodeToWinChar[extension] || extension;
      return "s" + winExtension + (uVowel === "ု" ? "K" : "L");
    }
  );
  
  // Ya Pint with top extensions only
  result = result.replace(
    new RegExp(`(ျ)([${TOP_EXTENSIONS.join("")}])(?!ု|ူ)`, 'g'), 
    (_, yaPint, extension) => {
      const winExtension = unicodeToWinChar[extension] || extension;
      return "s" + winExtension;
    }
  );
  
  // Basic case: Ya Pint with ု or ူ only
  result = result.replace(/(ျ)(ု|ူ)/g, (_, ya, u) => u === "ု" ? "sK" : "sL");
  
  return result;
}

// Function to preprocess န characters with extensions
export function preprocessNaCharacter(text: string): string {
  // First, handle the specific case of န + ြ 
  // Note: By this time ြ + န has already been reordered to ြ + န by reorderYaYit
  let result = text.replace(/(ြ)(န)/g, (_, yaYit) => yaYit + "E");
  
  // Then handle other extensions
  result = result.replace(/န(ှ|ျ|ွ|္[က-အ])/g, (_, extension) => "E" + extension);
  
  return result;
}

export function reorderThaWayHtoe(text: string): string {
  const eVowelPattern = /([\u1000-\u1021])([\u103B-\u103E\u1031\u102D\u102E\u102F\u1030\u1032\u1036\u1037\u1039]*)(ေ)([\u103B-\u103E\u1037\u1039]*)/g;
  
  return text.replace(eVowelPattern, (_, consonant, modifiersBefore, eVowel, modifiersAfter) => 
    eVowel + consonant + modifiersBefore + modifiersAfter
  );
}

export function handleYaychaShayHtoe(text: string): string {
  return text.replace(/ါ်/g, ":");
}

export function handleHaHtoe2ChaungNgin(text: string): string {
  return text.replace(/ှူ/g, "SL");
}

export function handleHaHtoe1ChaungNgin(text: string): string {
  return text.replace(/ှု/g, "I");
}

export function handleSpecialTopExtensions(text: string): string {  
  let result = text;
  // Already processed 'F' character (after reorderNgaThet and handleDoubleStoryCharacters)
  result = result.replace(/F(ိ|d)/g, "Ø");
  result = result.replace(/F(ီ|D)/g, "Ð");
  result = result.replace(/F(ံ|H)/g, "ø");
  result = result.replace(/ိံ|dH/g, "ð");
  return result;
}

export function handleWaSwelHatHtoe(text: string): string {
  let result = text;
  result = result.replace(/ညွှ/g, "ò");
  result = result.replace(/ညွ/g, "ñG");
  result = result.replace(/ွှ/g, "T");
  return result;
}

export function handleYaKout(text: string): string {
  let result = text;
  result = result.replace(/ရု/g, "½k");
  result = result.replace(/ရှု/g, "½I");
  return result;
}

// Function to handle Ya Yit (ြ) combinations based on character width
export function handleYaYitCombinations(text: string): string {
  let result = text;
  
  // 0. First handle special cases: Ya Yit + Wa Swel for both double and single counters
  // Special case for double counters + Ya Yit + Wa Swel
  for (const char of DOUBLE_COUNTERS) {
    result = result.replace(new RegExp(`(ြ)(${char})(ွ)`, 'g'), 
      (_, yaYit, consonant, waSwel) => {
        const winConsonant = unicodeToWinChar[consonant] || consonant;
        return "~" + winConsonant + waSwel;
      }
    );
  }
  
  // Special case for single counters + Ya Yit + Wa Swel
  result = result.replace(/(ြ)([က-အ])(ွ)/g, 
    (_, yaYit, consonant, waSwel) => {
      if (DOUBLE_COUNTERS.includes(consonant)) {
        return _; // Already handled above
      }
      const winConsonant = unicodeToWinChar[consonant] || consonant;
      return "`" + winConsonant + waSwel;
    }
  );
  
  // 1. Handle double counters first
  for (const char of DOUBLE_COUNTERS) {
    // Most specific: Double counters with top extension AND ု/ူ (like ကြုံ → BuHK)
    // Handle both orders: extension+vowel and vowel+extension
    result = result.replace(new RegExp(`(ြ)(${char})([${TOP_EXTENSIONS.join("")}])(ု|ူ)|(ြ)(${char})(ု|ူ)([${TOP_EXTENSIONS.join("")}])`, 'g'), 
      (_, yaYit1, consonant1, extension1, uVowel1, yaYit2, consonant2, uVowel2, extension2) => {
        // Determine which pattern matched
        const consonant = consonant1 || consonant2;
        const extension = extension1 || extension2;
        const uVowel = uVowel1 || uVowel2;
        
        const winConsonant = unicodeToWinChar[consonant] || consonant;
        const winExtension = unicodeToWinChar[extension] || extension;
        return "B" + winConsonant + winExtension + (uVowel === "ု" ? "K" : "L");
      }
    );
    
    // Double counters with top extensions only (like ကြံ → BuH)
    result = result.replace(new RegExp(`(ြ)(${char})([${TOP_EXTENSIONS.join("")}])(?!ု|ူ)`, 'g'), 
      (_, yaYit, consonant, extension) => {
        const winConsonant = unicodeToWinChar[consonant] || consonant;
        const winExtension = unicodeToWinChar[extension] || extension;
        return "B" + winConsonant + winExtension;
      }
    );
    
    // Double counters with ု or ူ only (like ကြု → MuK)
    result = result.replace(new RegExp(`(ြ)(${char})(ု|ူ)`, 'g'), 
      (match, yaYit, consonant, uVowel) => {
        // Skip if already processed with topExtension + ု/ူ
        if (match.length > 3 && TOP_EXTENSIONS.some(ext => match.includes(ext))) {
          return match;
        }
        const winConsonant = unicodeToWinChar[consonant] || consonant;
        return "M" + winConsonant + (uVowel === "ု" ? "K" : "L");
      }
    );
    
    // Double counters without any extensions (like ကြ → Mu)
    result = result.replace(new RegExp(`(ြ)(${char})(?![${TOP_EXTENSIONS.join("")}ုူွ])`, 'g'), 
      (_, yaYit, consonant) => {
        const winConsonant = unicodeToWinChar[consonant] || consonant;
        return "M" + winConsonant;
      }
    );
  }
  
  // 2. Then handle single counters
  
  // Most specific: Single counters with top extension AND ု/ူ
  // Handle both orders: extension+vowel and vowel+extension
  result = result.replace(new RegExp(`(ြ)([က-အ])([${TOP_EXTENSIONS.join("")}])(ု|ူ)|(ြ)([က-အ])(ု|ူ)([${TOP_EXTENSIONS.join("")}])`, 'g'), 
    (_, yaYit1, consonant1, extension1, uVowel1, yaYit2, consonant2, uVowel2, extension2) => {
      // Determine which pattern matched
      const consonant = consonant1 || consonant2;
      const extension = extension1 || extension2;
      const uVowel = uVowel1 || uVowel2;
      
      if (DOUBLE_COUNTERS.includes(consonant)) {
        return _; // Already handled above
      }
      const winConsonant = unicodeToWinChar[consonant] || consonant;
      const winExtension = unicodeToWinChar[extension] || extension;
      return "N" + winConsonant + winExtension + (uVowel === "ု" ? "K" : "L");
    }
  );
  
  // Single counters with top extensions only
  result = result.replace(new RegExp(`(ြ)([က-အ])([${TOP_EXTENSIONS.join("")}])(?!ု|ူ)`, 'g'), 
    (_, yaYit, consonant, extension) => {
      if (DOUBLE_COUNTERS.includes(consonant)) {
        return _; // Already handled above
      }
      const winConsonant = unicodeToWinChar[consonant] || consonant;
      const winExtension = unicodeToWinChar[extension] || extension;
      return "N" + winConsonant + winExtension;
    }
  );
  
  // Single counters with ု or ူ only
  result = result.replace(/(ြ)([က-အ])(ု|ူ)/g, 
    (match, yaYit, consonant, uVowel) => {
      if (DOUBLE_COUNTERS.includes(consonant) || match.length > 3 && 
          TOP_EXTENSIONS.some(ext => match.includes(ext))) {
        return match; // Already handled above
      }
      const winConsonant = unicodeToWinChar[consonant] || consonant;
      return "j" + winConsonant + (uVowel === "ု" ? "K" : "L");
    }
  );
  
  // Single counters without extensions
  result = result.replace(new RegExp(`(ြ)([က-အ])(?![${TOP_EXTENSIONS.join("")}ုူွ])`, 'g'), 
    (_, yaYit, consonant) => {
      if (DOUBLE_COUNTERS.includes(consonant)) {
        return _; // Already handled above
      }
      const winConsonant = unicodeToWinChar[consonant] || consonant;
      return "j" + winConsonant;
    }
  );
  
  return result;
}

// Function to handle reordering and conversion of Ya Yit combinations
export function reorderYaYit(text: string): string {
  return text.replace(/([\u1000-\u1021])(ြ)/g, (_, consonant, yaYit) => yaYit + consonant);
}

// Map of double story character symbols in Win Innwa format
export const doubleStoryMap: Record<string, string> = {
  "္ဃ": "¢",
  "္ခ": "©",
  "္မ": "®",
  "္ဓ": "¨",
  "္ဋ": "³",
  "္ဒ": "´",
  "္ဂ": "¾",
  "္ဗ": "º",
  "္ဇ": "Æ",
  "္ပ": "Ü",
  "္ဖ": "æ",
  "္န": "é",
  "္စ": "ö",
  "္ဎ": "·",
  "္ဏ": "Ö",
  "္က": "ú",
  "္လ": "'",
  "င်္": "F"
};

// Function to handle special double story characters based on counter type
export function handleSpecialDoubleStoryCharacters(text: string): string {
  let result = text;
  
  // Handle special double story characters with consonants before processing
  
  // Handle ္တ - Double counter: å, Single counter: Å
  result = result.replace(/([က-အE])(္တ)/g, (_, consonant) => {
    const winConsonant = unicodeToWinChar[consonant] || consonant;
    return winConsonant + (DOUBLE_COUNTERS.includes(consonant) ? "å" : "Å");
  });
  
  // Handle ္ထ - Double counter: ¬, Single counter: ¦
  result = result.replace(/([က-အE])(္ထ)/g, (_, consonant) => {
    const winConsonant = unicodeToWinChar[consonant] || consonant;
    return winConsonant + (DOUBLE_COUNTERS.includes(consonant) ? "¬" : "¦");
  });
  
  // Handle ္ဆ - Double counter: °, Single counter: ä
  result = result.replace(/([က-အE])(္ဆ)/g, (_, consonant) => {
    const winConsonant = unicodeToWinChar[consonant] || consonant;
    return winConsonant + (DOUBLE_COUNTERS.includes(consonant) ? "°" : "ä");
  });
  
  // Handle ္ဘ - Double counter: É, Single counter: Ç
  result = result.replace(/([က-အE])(္ဘ)/g, (_, consonant, doubleStory) => {
    const winConsonant = unicodeToWinChar[consonant] || consonant;
    return winConsonant + (DOUBLE_COUNTERS.includes(consonant) ? "É" : "Ç");
  });
  
  return result;
}

// Function to handle all double story characters
export function handleDoubleStoryCharacters(text: string): string {
  const SPECIAL_CASES = ["္တ", "္ထ", "္ဆ", "္ဘ"];
  let result = text;
  
  // Handle double story characters with ု and ူ vowels
  result = result.replace(/(္[က-အ])(ု|ူ)/g, (match, doubleStory, vowel) => {
    // Skip the special cases we handle separately
    if (SPECIAL_CASES.includes(doubleStory)) {
      return match;
    }
    const symbol = doubleStoryMap[doubleStory] || doubleStory;
    return symbol + (vowel === "ု" ? "K" : "L");
  });
  
  // Then handle remaining basic double story characters
  for (const [unicodeChar, winChar] of Object.entries(doubleStoryMap)) {
    // Skip the special cases we handle separately
    if (SPECIAL_CASES.includes(unicodeChar)) {
      continue;
    }
    result = result.replace(new RegExp(unicodeChar, 'g'), winChar);
  }
  
  return result;
}

// Character mappings for conversion
export const unicodeToWinChar: Record<string, string> = {
  က: "u", ခ: "c", ဂ: "*", ဃ: "C", င: "i", စ: "p", ဆ: "q", ဇ: "Z", ဈ: "ps", ဉ: "O",
  ည: "n", ဋ: "#", ဌ: "X", ဍ: "!", ဎ: "!", ဏ: "P", တ: "w", ထ: "x", ဒ: "'", ဓ: '"',
  န: "e", ပ: "y", ဖ: "z", ဗ: "A", ဘ: "b", မ: "r", ယ: ",", ရ: "&", လ: "v", ဝ: "0",
  သ: "o", ဟ: "[", ဠ: "V", အ: "t",

  // Vowels
  "ါ": "g", "ာ": "m", "ိ": "d", "ီ": "D", "ု": "k", "ူ": "l", "ေ": "a", "ဲ": "J",
  "ံ": "H", "့": "h", "း": ";", "်": "f", "ျ": "s", "ြ": "j", "ွ": "G", "ှ": "S", "ွှ":"T",
  
  // Marks
  "္": "f",
  
  // Numbers
  "၀": "0", "၁": "1", "၂": "2", "၃": "3", "၄": "4", "၅": "5", "၆": "6", "၇": "7", "၈": "8", "၉": "9",
  
  // Punctuation
  "၊": "/", "။": "?", " ": " ",
  
  // Special Characters
  "ဧ": "{", "၏": "\\", "ဩ": "Mo", "၎င်း": "4if;", ဿ: "ó", "၍": "í", "၌": "ü", "၎": "¤",
  ဉာ: "ˆ", ဥ: "O", ဦ: "OD", ဣ: "£", "\n": "\n",
};

// Convert Unicode text to Win Innwa text
export function uni2win(unicode: string): string {
  if (!unicode) return ""; // Early return for empty input
  
  try {
    // Process the text through a pipeline of transformation functions
    let result = unicode;
    
    // Step 1: Reordering operations
    result = reorderNgaThet(result);
    result = reorderThaWayHtoe(result);
    result = reorderYaYit(result);
    
    // Step 2: Special character preprocessing
    result = preprocessNaCharacter(result);
    
    // Step 3: Pattern-based replacements
    result = handleYaYitCombinations(result);
    result = handleYaPint(result);

    // Step 4: Handle double story characters
    result = handleSpecialDoubleStoryCharacters(result);
    result = handleDoubleStoryCharacters(result);
    
    // Step 5: Handle special characters and extensions
    result = handleOutKaMyint(result);
    result = handleWaSwelHatHtoe(result);
    result = handleYaychaShayHtoe(result);
    result = handleHaHtoe2ChaungNgin(result);
    result = handleHaHtoe1ChaungNgin(result);
    result = handleSpecialTopExtensions(result);
    result = handleYaKout(result);
    
    // Step 6: Special double story combinations
    result = result.replace(/ဍ္ဎ/g, "¹");
    result = result.replace(/ဋ္ဌ/g, "|");
    result = result.replace(/င်္ဂြိို/g, "ì");
    result = result.replace(/ဏ္ဍ/g, "‹");

    // Step 7: Character-by-character conversion for any remaining characters
    let finalResult = '';
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      finalResult += unicodeToWinChar[char as keyof typeof unicodeToWinChar] || char;
    }
    
    return finalResult;
  } catch (error) {
    console.error("Error in Unicode to Win conversion:", error);
    return unicode || ""; // Return the original text in case of an error, or empty string if undefined
  }
}

// Reversed mapping from Win Innwa to Unicode
// Create a mapping from Win Innwa to Unicode by reversing unicodeToWinChar
export const winToUnicodeChar: Record<string, string> = {
  "u": "က", "c": "ခ", "*": "ဂ", "C": "ဃ", "i": "င", "p": "စ", "q": "ဆ", "Z": "ဇ", "ps": "ဈ", 
  "n": "ည", "#": "ဋ", "X": "ဌ", "!": "ဍ", "P": "ဏ", "w": "တ", "x": "ထ", "'": "ဒ", '"': "ဓ",
  "e": "န", "y": "ပ", "z": "ဖ", "A": "ဗ", "b": "ဘ", "r": "မ", ",": "ယ", "&": "ရ", "v": "လ",
  "o": "သ", "[": "ဟ", "V": "ဠ", "t": "အ",

  // Vowels
  "g": "ါ", "m": "ာ", "d": "ိ", "D": "ီ", "k": "ု", "l": "ူ", "a": "ေ", "J": "ဲ",
  "H": "ံ", "h": "့", ";": "း", "f": "်", "s": "ျ", "j": "ြ", "G": "ွ", "S": "ှ", "T": "ွှ",
  
  // Marks
  // "f": "္",
  
  // Numbers
  "0": "၀", "1": "၁", "2": "၂", "3": "၃", "4": "၄", "5": "၅", "6": "၆", "7": "၇", "8": "၈", "9": "၉",
  
  // Punctuation
  "/": "၊", "?": "။", " ": " ",
  
  // Special Characters
  "{": "ဧ", "\\": "၏", "Mo": "ဩ", "4if;": "၎င်း", "ó": "ဿ", "í": "၍", "ü": "၌", "¤": "၎",
  "ˆ": "ဉာ", "O": "ဥ", "OD": "ဦ", "£": "ဣ", "\n": "\n",
};

// Reversed mappings for special and double story characters
export const winToDoubleStoryMap: Record<string, string> = {
  "¢": "္ဃ",
  "©": "္ခ",
  "®": "္မ",
  "¨": "္ဓ",
  "³": "္ဋ",
  "´": "္ဒ",
  "¾": "္ဂ",
  "º": "္ဗ",
  "Æ": "္ဇ",
  "Ü": "္ပ",
  "æ": "္ဖ",
  "é": "္န",
  "ö": "္စ",
  "·": "္ဎ",
  "Ö": "္ဏ",
  "ú": "္က",
  "'": "္လ",
  "F": "င်္",
  "å": "္တ", // Double counter
  "Å": "္တ", // Single counter
  "¬": "္ထ", // Double counter
  "¦": "္ထ", // Single counter
  "°": "္ဆ", // Double counter
  "ä": "္ဆ", // Single counter
  "É": "္ဘ", // Double counter
  "Ç": "္ဘ", // Single counter
};

// Reverse special double story combinations
export function reverseSpecialDoubleStoryCombinations(text: string): string {
  let result = text;
  result = result.replace(/¹/g, "ဍ္ဎ");
  result = result.replace(/\|/g, "ဋ္ဌ");
  result = result.replace(/ì/g, "င်္ဂြိို");
  result = result.replace(/‹/g, "ဏ္ဍ");
  return result;
}

// Reverse Ya Kout handling
export function reverseYaKout(text: string): string {
  let result = text;
  result = result.replace(/½k/g, "ရု");
  result = result.replace(/½I/g, "ရှု");
  return result;
}

// Reverse special top extensions
export function reverseSpecialTopExtensions(text: string): string {
  let result = text;
  result = result.replace(/Ø/g, "Fိ");
  result = result.replace(/Ð/g, "Fီ");
  result = result.replace(/ø/g, "Fံ");
  result = result.replace(/ð/g, "ိံ");
  return result;
}

// Reverse Ha Htoe with 1 Chaung Ngin
export function reverseHaHtoe1ChaungNgin(text: string): string {
  return text.replace(/I/g, "ှု");
}

// Reverse Ha Htoe with 2 Chaung Ngin
export function reverseHaHtoe2ChaungNgin(text: string): string {
  return text.replace(/SL/g, "ှူ");
}

// Reverse Yay Cha Shay Htoe
export function reverseYaychaShayHtoe(text: string): string {
  return text.replace(/:/g, "ါ်");
}

// Reverse Wa Swel and Hat Htoe combinations
export function reverseWaSwelHatHtoe(text: string): string {
  let result = text;
  result = result.replace(/ò/g, "ညွှ");
  result = result.replace(/ñG/g, "ညွ");
  result = result.replace(/T/g, "ွှ");
  return result;
}

// Reverse Out Ka Myint handling
export function reverseOutKaMyint(text: string): string {
  let result = text;
  
  // Replace 'h' with Out Ka Myint (့)
  result = result.replace(/h/g, "့");
  
  // Replace 'Y' with Out Ka Myint for specific cases
  result = result.replace(/([န][ွှေိီဲံုူျြ]*)Y/g, "$1့");
  result = result.replace(/E([ွှေိီဲံုူျြ]*)Y/g, "E$1့");
  
  // Replace 'U' with Out Ka Myint for specific cases
  result = result.replace(/([ရ][ွှေိီဲံုူျြ]*)U/g, "$1့");
  result = result.replace(/E([ွှေိီဲံုူျြ]*)U/g, "$1့");
  
  // Handle other cases where U/Y are used for Out Ka Myint
  result = result.replace(/([က-အ]္[က-အ])U/g, "$1့");
  result = result.replace(/([က-အ]ျ[ိီဲံုူွှေ]*)U/g, "$1့");
  
  // Handle Ya Pint and Hat Htoe with Out Ka Myint
  result = result.replace(/([က-အ]ျ)U/g, "$1့");
  result = result.replace(/([က-ဍဎဏတ-ဝသ-အ]ှ[ိီဲံု]*)Y/g, "$1့");
  
  // Handle Wa-swe and Long U with Out Ka Myint
  result = result.replace(/([က-ဍဎဏတ-နပ-ရလဝသ-အ][ွှ])U/g, "$1့");
  result = result.replace(/([က-ဍဎဏတ-နပ-ရလဝသ-အ]ူ)U/g, "$1့");
  
  return result;
}

// Reverse double story characters handling
export function reverseDoubleStoryCharacters(text: string): string {
  let result = text;
  
  // First handle special cases with vowels
  for (const [winChar, unicodeChar] of Object.entries(winToDoubleStoryMap)) {
    result = result.replace(new RegExp(`${winChar}K`, 'g'), `${unicodeChar}ု`);
    result = result.replace(new RegExp(`${winChar}L`, 'g'), `${unicodeChar}ူ`);
  }
  
  // Then handle basic double story characters
  for (const [winChar, unicodeChar] of Object.entries(winToDoubleStoryMap)) {
    result = result.replace(new RegExp(winChar, 'g'), unicodeChar);
  }
  
  return result;
}

// Reverse special double story characters
export function reverseSpecialDoubleStoryCharacters(text: string): string {
  let result = text;
  
  // Handle the special cases for double and single counters
  // For single counters
  for (const counter of DOUBLE_COUNTERS) {
    // Double counters
    result = result.replace(new RegExp(`${counter}å`, 'g'), `${counter}္တ`);
    result = result.replace(new RegExp(`${counter}¬`, 'g'), `${counter}္ထ`);
    result = result.replace(new RegExp(`${counter}°`, 'g'), `${counter}္ဆ`);
    result = result.replace(new RegExp(`${counter}É`, 'g'), `${counter}္ဘ`);
  }
  
  // For single counters (all other consonants)
  result = result.replace(/([က-အE])Å/g, (_, consonant) => {
    if (DOUBLE_COUNTERS.includes(consonant)) return _; // Skip double counters
    return `${consonant}္တ`;
  });
  
  result = result.replace(/([က-အE])¦/g, (_, consonant) => {
    if (DOUBLE_COUNTERS.includes(consonant)) return _; // Skip double counters
    return `${consonant}္ထ`;
  });
  
  result = result.replace(/([က-အE])ä/g, (_, consonant) => {
    if (DOUBLE_COUNTERS.includes(consonant)) return _; // Skip double counters
    return `${consonant}္ဆ`;
  });
  
  result = result.replace(/([က-အE])Ç/g, (_, consonant) => {
    if (DOUBLE_COUNTERS.includes(consonant)) return _; // Skip double counters
    return `${consonant}္ဘ`;
  });
  
  return result;
}

// Reverse Ya Pint handling
export function reverseYaPint(text: string): string {
  let result = text;
  
  // Special cases first
  result = result.replace(/W/g, "ျွှ");
  result = result.replace(/R/g, "ျွ");
  
  // Ya Pint with top extensions AND ု/ူ
  result = result.replace(/s([dDJH])([KL])/g, (_, extension, uVowel) => {
    const unicodeExtension = winToUnicodeChar[extension] || extension;
    return "ျ" + unicodeExtension + (uVowel === "K" ? "ု" : "ူ");
  });
  
  // Ya Pint with top extensions only
  result = result.replace(/s([dDJH])/g, (_, extension) => {
    const unicodeExtension = winToUnicodeChar[extension] || extension;
    return "ျ" + unicodeExtension;
  });
  
  // Basic cases: Ya Pint with ု or ူ only
  result = result.replace(/sK/g, "ျု");
  result = result.replace(/sL/g, "ျူ");
  
  return result;
}

// Reverse Ya Yit combinations
export function reverseYaYitCombinations(text: string): string {
  let result = text;
  
  // Special case: Ya Yit + Wa Swel for double counters
  result = result.replace(/~([u-z*C-Z!-Ai-rtv\[0o,])(G|T)/g, (_, consonant, waSwel) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    const unicodeWaSwel = winToUnicodeChar[waSwel] || waSwel;
    return "ြ" + unicodeConsonant + unicodeWaSwel;
  });
  
  // Special case: Ya Yit + Wa Swel for single counters
  result = result.replace(/`([u-z*C-Z!-Ai-rtv\[0o,])(G|T)/g, (_, consonant, waSwel) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    const unicodeWaSwel = winToUnicodeChar[waSwel] || waSwel;
    return "ြ" + unicodeConsonant + unicodeWaSwel;
  });
  
  // Double counters with top extension AND ု/ူ
  result = result.replace(/B([u-z*C-Z!-Ai-rtv\[0o,])([dDJH])([KL])/g, (_, consonant, extension, uVowel) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    const unicodeExtension = winToUnicodeChar[extension] || extension;
    return "ြ" + unicodeConsonant + unicodeExtension + (uVowel === "K" ? "ု" : "ူ");
  });
  
  // Double counters with top extensions only
  result = result.replace(/B([u-z*C-Z!-Ai-rtv\[0o,])([dDJH])/g, (_, consonant, extension) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    const unicodeExtension = winToUnicodeChar[extension] || extension;
    return "ြ" + unicodeConsonant + unicodeExtension;
  });
  
  // Double counters with ု or ူ only
  result = result.replace(/M([u-z*C-Z!-Ai-rtv\[0o,])([KL])/g, (_, consonant, uVowel) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    return "ြ" + unicodeConsonant + (uVowel === "K" ? "ု" : "ူ");
  });
  
  // Double counters without any extensions
  result = result.replace(/M([u-z*C-Z!-Ai-rtv\[0o,])/g, (_, consonant) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    return "ြ" + unicodeConsonant;
  });
  
  // Single counters with top extension AND ု/ူ
  result = result.replace(/N([u-z*C-Z!-Ai-rtv\[0o,])([dDJH])([KL])/g, (_, consonant, extension, uVowel) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    const unicodeExtension = winToUnicodeChar[extension] || extension;
    return "ြ" + unicodeConsonant + unicodeExtension + (uVowel === "K" ? "ု" : "ူ");
  });
  
  // Single counters with top extensions only
  result = result.replace(/N([u-z*C-Z!-Ai-rtv\[0o,])([dDJH])/g, (_, consonant, extension) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    const unicodeExtension = winToUnicodeChar[extension] || extension;
    return "ြ" + unicodeConsonant + unicodeExtension;
  });
  
  // Single counters with ု or ူ only
  result = result.replace(/j([u-z*C-Z!-Ai-rtv\[0o,])([KL])/g, (_, consonant, uVowel) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    return "ြ" + unicodeConsonant + (uVowel === "K" ? "ု" : "ူ");
  });
  
  // Single counters without extensions
  result = result.replace(/j([u-z*C-Z!-Ai-rtv\[0o,])/g, (_, consonant) => {
    const unicodeConsonant = winToUnicodeChar[consonant] || consonant;
    return "ြ" + unicodeConsonant;
  });
  
  return result;
}

// Reverse preprocessing of န characters
export function reversePreprocessNaCharacter(text: string): string {
  let result = text;
  
  // Reverse 'E' to 'န'
  result = result.replace(/E(ှ|ျ|ွ|္[က-အ])/g, "န$1");
  
  // Reverse ြE to ြန
  result = result.replace(/(ြ)E/g, "$1န");
  
  return result;
}

// Reverse reordering of Tha Way Htoe
export function reverseReorderThaWayHtoe(text: string): string {
  return text.replace(/(ေ)([\u1000-\u1021])([\u103B-\u103E\u1031\u102D\u102E\u102F\u1030\u1032\u1036\u1037\u1039]*)/g, 
    (_, eVowel, consonant, modifiers) => consonant + modifiers + eVowel
  );
}

// Reverse reordering of Ya Yit
export function reverseReorderYaYit(text: string): string {
  return text.replace(/(ြ)([\u1000-\u1021])/g, (_, yaYit, consonant) => consonant + yaYit);
}

// Reverse reordering of Nga Thet
export function reverseReorderNgaThet(text: string): string {
  return text.replace(/([\u1000-\u109F])(င်္)/g, (_, nextChar, ngaThet) => ngaThet + nextChar);
}

// Convert Win Innwa text to Unicode
export function win2uni(winText: string): string {
  if (!winText) return ""; // Early return for empty input
  
  try {
    // Step 1: Character-by-character conversion for base characters
    let result = '';
    let i = 0;
    
    while (i < winText.length) {
      // Check for multi-character sequences first
      let found = false;
      
      // Check for 2-4 character sequences in the mapping
      for (let len = 4; len >= 1; len--) {
        if (i + len <= winText.length) {
          const seq = winText.substring(i, i + len);
          if (winToUnicodeChar[seq]) {
            result += winToUnicodeChar[seq];
            i += len;
            found = true;
            break;
          }
        }
      }
      
      // If no multi-character sequence found, try single character
      if (!found) {
        const char = winText[i];
        result += winToUnicodeChar[char] || char;
        i += 1;
      }
    }
    
    // Step 2: Handle all the special patterns and replacements in reverse order
    
    // Start with special double story combinations
    result = reverseSpecialDoubleStoryCombinations(result);
    
    // Handle special characters and extensions
    result = reverseYaKout(result);
    result = reverseSpecialTopExtensions(result);
    result = reverseHaHtoe1ChaungNgin(result);
    result = reverseHaHtoe2ChaungNgin(result);
    result = reverseYaychaShayHtoe(result);
    result = reverseWaSwelHatHtoe(result);
    result = reverseOutKaMyint(result);
    
    // Handle double story characters
    result = reverseDoubleStoryCharacters(result);
    result = reverseSpecialDoubleStoryCharacters(result);
    
    // Handle pattern-based replacements
    result = reverseYaPint(result);
    result = reverseYaYitCombinations(result);
    
    // Handle special character preprocessing
    result = reversePreprocessNaCharacter(result);
    
    // Handle character reordering in reverse
    result = reverseReorderYaYit(result);
    result = reverseReorderThaWayHtoe(result);
    result = reverseReorderNgaThet(result);
    
    return result;
  } catch (error) {
    console.error("Error in Win to Unicode conversion:", error);
    return winText || ""; // Return the original text in case of an error, or empty string if undefined
  }
}

