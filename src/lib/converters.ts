// Character mappings for conversion between Unicode, Zawgyi, and Win fonts
import Rabbit from "rabbit-node";

// Character mappings for Unicode to Win conversions
const unicodeToWinChar: Record<string, string> = {
  // Consonants
  က: "u",
  ခ: "c",
  ဂ: "*",
  ဃ: "C",
  င: "i",
  စ: "p",
  ဆ: "q",
  ဇ: "Z",
  ဈ: "ps",
  ဉ: "O",
  ည: "n",
  ဋ: "#",
  ဌ: "X",
  ဍ: "!",
  ဎ: "!",
  ဏ: "P",
  တ: "w",
  ထ: "x",
  ဒ: "'",
  ဓ: '"',
  န: "e",
  ပ: "y",
  ဖ: "z",
  ဗ: "A",
  ဘ: "b",
  မ: "r",
  ယ: ",",
  ရ: "&",
  လ: "v",
  ဝ: "0",
  သ: "o",
  ဟ: "[",
  ဠ: "V",
  အ: "t",

  // Vowels and medials
  "ါ": "g",
  "ာ": "m",
  "ိ": "d",
  "ီ": "D",
  "ု": "k",
  "ူ": "l",
  "ေ": "a",
  "ဲ": "J",
  "ံ": "H",
  "့": "h",
  "း": ";",
  "်": "f",
  "ျ": "s",
  "ြ": "j",
  "ွ": "G",
  "ှ": "S",
  
  // Marks
  "္": "f",
  
  // Numbers
  "၀": "0",
  "၁": "1",
  "၂": "2",
  "၃": "3",
  "၄": "4",
  "၅": "5",
  "၆": "6",
  "၇": "7",
  "၈": "8",
  "၉": "9",
  
  // Punctuation and special characters
  "၊": "/",
  "။": "?",
  " ": " ",
  "၏": "\\",
  "ဩ": "Mo",
  "၎င်း": "4if;",
  "ဿ": "ó",
  "၍": "í",
  "၌": "ü",
  "၎": "¤",
  "င်္": "F",
  "ဉာ": "ˆ",
  "ဥ": "O",
  "ဦ": "OD",
  "ဣ": "£",
};

// Function to reorder င်္ with adjacent characters
function reorderNgaThet(text: string): string {
  // Create a pattern to match င်္ followed by any Myanmar character
  const ngaThetPattern = /(င်္)([\u1000-\u109F])/g;

  // Replace each occurrence by reversing the order
  return text.replace(ngaThetPattern, (match, ngaThet, nextChar) => {
    return nextChar + ngaThet;
  });
}

// Function to handle Ya Pint + U vowel combinations
function handleYaPint(text: string): string {
  // This regex matches Ya Pint followed by U vowels
  return text.replace(/(ျ)(ု|ူ)/g, (match, ya, u) => {
    // Convert to Win-Innwa format
    return u === "ု" ? "sK" : "sL";
  });
}

// Convert Unicode text to Win text
export function unicodeToWin(unicode: string): string {
  if (!unicode) return "";
  
  try {
    // Reorder Nga Thet combinations first
    let result = reorderNgaThet(unicode);
    result = handleYaPint(result);
    
    // Special character sequences
    result = result.replace(/ဍ္ဎ/g, "¹");
    result = result.replace(/ဋ္ဌ/g, "|");
    
    // Process known compound sequences
    result = result.replace(/ကေ/g, "au");
    result = result.replace(/ခေ/g, "ac");
    result = result.replace(/ဂေ/g, "a*");
    result = result.replace(/ဃေ/g, "aC");
    result = result.replace(/ငေ/g, "ai");
    result = result.replace(/စေ/g, "ap");
    result = result.replace(/ဆေ/g, "aq");
    result = result.replace(/ဇေ/g, "aZ");
    result = result.replace(/ညေ/g, "an");
    result = result.replace(/ဋေ/g, "a#");
    result = result.replace(/ဌေ/g, "aX");
    result = result.replace(/ဍေ/g, "a!");
    result = result.replace(/ဎေ/g, "a!");
    result = result.replace(/ဏေ/g, "aP");
    result = result.replace(/တေ/g, "aw");
    result = result.replace(/ထေ/g, "ax");
    result = result.replace(/ဒေ/g, "a'");
    result = result.replace(/ဓေ/g, 'a"');
    result = result.replace(/နေ/g, "ae");
    result = result.replace(/ပေ/g, "ay");
    result = result.replace(/ဖေ/g, "az");
    result = result.replace(/ဗေ/g, "aA");
    result = result.replace(/ဘေ/g, "ab");
    result = result.replace(/မေ/g, "ar");
    result = result.replace(/ယေ/g, "a,");
    result = result.replace(/ရေ/g, "a&");
    result = result.replace(/လေ/g, "av");
    result = result.replace(/ဝေ/g, "a0");
    result = result.replace(/သေ/g, "ao");
    result = result.replace(/ဟေ/g, "a[");
    result = result.replace(/ဠေ/g, "aV");
    result = result.replace(/အေ/g, "at");

    // Common complex combinations
    result = result.replace(/ရှေ/g, "a&S");
    
    // Character by character conversion for remaining characters
    let processedResult = "";
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      const mapped = unicodeToWinChar[char];
      processedResult += mapped !== undefined ? mapped : char;
    }
    
    return processedResult;
  } catch (error) {
    console.error("Unicode to Win conversion error:", error);
    return unicode; // Return original text on error
  }
}

// Create a reverse mapping for Win to Unicode
const winToUnicodeChar: Record<string, string> = {};
for (const [unicode, win] of Object.entries(unicodeToWinChar)) {
  if (win && win.length === 1) {
    // Only add simple one-to-one mappings
    winToUnicodeChar[win] = unicode;
  }
}

// Function to convert Win text to Unicode
export function winToUnicode(win: string): string {
  if (!win) return "";
  
  try {
    // Process special sequences first
    let result = win;
    
    // Special character sequences
    result = result.replace(/F/g, "င်္");
    result = result.replace(/\|/g, "ဋ္ဌ");
    result = result.replace(/¹/g, "ဍ္ဎ");
    result = result.replace(/‹/g, "ဏ္ဍ");
    
    // E vowel (a) + consonant combinations
    result = result.replace(/au/g, "ကေ");
    result = result.replace(/ac/g, "ခေ");
    result = result.replace(/a\*/g, "ဂေ");
    result = result.replace(/aC/g, "ဃေ");
    result = result.replace(/ai/g, "ငေ");
    result = result.replace(/ap/g, "စေ");
    result = result.replace(/aq/g, "ဆေ");
    result = result.replace(/aZ/g, "ဇေ");
    result = result.replace(/an/g, "ညေ");
    result = result.replace(/a#/g, "ဋေ");
    result = result.replace(/aX/g, "ဌေ");
    result = result.replace(/a!/g, "ဍေ");
    result = result.replace(/aP/g, "ဏေ");
    result = result.replace(/aw/g, "တေ");
    result = result.replace(/ax/g, "ထေ");
    result = result.replace(/a'/g, "ဒေ");
    result = result.replace(/a"/g, "ဓေ");
    result = result.replace(/ae/g, "နေ");
    result = result.replace(/ay/g, "ပေ");
    result = result.replace(/az/g, "ဖေ");
    result = result.replace(/aA/g, "ဗေ");
    result = result.replace(/ab/g, "ဘေ");
    result = result.replace(/ar/g, "မေ");
    result = result.replace(/a,/g, "ယေ");
    result = result.replace(/a&/g, "ရေ");
    result = result.replace(/av/g, "လေ");
    result = result.replace(/a0/g, "ဝေ");
    result = result.replace(/ao/g, "သေ");
    result = result.replace(/a\[/g, "ဟေ");
    result = result.replace(/aV/g, "ဠေ");
    result = result.replace(/at/g, "အေ");

    // Special combinations
    result = result.replace(/a&S/g, "ရှေ");
    result = result.replace(/4if;/g, "၎င်း");
    result = result.replace(/OD/g, "ဦ");
    
    // Handle Ya Pint (s) combinations
    result = result.replace(/sK/g, "ျု");
    result = result.replace(/sL/g, "ျူ");
    
    // Process character by character conversion for remaining characters
    let processedResult = "";
    let i = 0;
    
    while (i < result.length) {
      // Try to match multi-character sequences first
      let found = false;

      // Look for known multi-character sequences
      const multiCharMappings = ["OD", "Mo", "4if;"];
      for (const seq of multiCharMappings) {
        if (result.substring(i, i + seq.length) === seq) {
          const unicodeChar = winToUnicodeChar[seq];
          if (unicodeChar) {
            processedResult += unicodeChar;
            i += seq.length;
            found = true;
            break;
          }
        }
      }
      
      // If no multi-character sequence matched, process single character
      if (!found) {
        const char = result[i];
        const unicodeChar = winToUnicodeChar[char];
        processedResult += unicodeChar || char;
        i++;
      }
    }
    
    return processedResult;
  } catch (error) {
    console.error("Win to Unicode conversion error:", error);
    return win; // Return original text on error
  }
}

// Convert Zawgyi to Win using intermediate Unicode conversion
export function zawgyiToWin(zawgyi: string): string {
  if (!zawgyi) return "";
  
  try {
    // First convert Zawgyi to Unicode
    const unicode = Rabbit.zg2uni(zawgyi);
    
    // Then convert Unicode to Win
    return unicodeToWin(unicode);
  } catch (error) {
    console.error("Zawgyi to Win conversion error:", error);
    return zawgyi; // Return original on error
  }
}

// Convert Win to Zawgyi using intermediate Unicode conversion
export function winToZawgyi(win: string): string {
  if (!win) return "";
  
  try {
    // First convert Win to Unicode
    const unicode = winToUnicode(win);
    
    // Then convert Unicode to Zawgyi
    return Rabbit.uni2zg(unicode);
  } catch (error) {
    console.error("Win to Zawgyi conversion error:", error);
    return win; // Return original on error
  }
}

// Export the Rabbit converter for Unicode <-> Zawgyi
export { Rabbit }; 