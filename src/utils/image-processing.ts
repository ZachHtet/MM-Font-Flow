import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

// Initialize Google Vision Client 
// (Assumes credentials are set via environment variable GOOGLE_APPLICATION_CREDENTIALS)
let visionClient: ImageAnnotatorClient | null = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new ImageAnnotatorClient();
  } else {
    console.warn('Vision API client not initialized: Missing GOOGLE_APPLICATION_CREDENTIALS');
  }
} catch (error) {
  console.error('Error initializing Vision API client:', error);
}

// Initialize Google Generative AI (Gemini)
// (Assumes API key is set via environment variable GOOGLE_GENERATIVE_AI_KEY)
let genAI: GoogleGenerativeAI | null = null;
try {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '';
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  } else {
    console.warn('Gemini API client not initialized: Missing NEXT_PUBLIC_GOOGLE_AI_API_KEY');
  }
} catch (error) {
  console.error('Error initializing Gemini API client:', error);
}

/**
 * Preprocesses an image to improve OCR accuracy
 * @param imageFile The image file to process
 * @returns Processed image as Buffer
 */
export async function preprocessImage(imageFile: File): Promise<Buffer> {
  try {
    const imageBuffer = await fileToBuffer(imageFile);
    
    // Use sharp to enhance the image for better OCR results
    const processedImage = await sharp(imageBuffer)
      // Convert to grayscale
      .grayscale()
      // Increase contrast
      .normalize()
      // Apply mild sharpening
      .sharpen()
      // Remove noise
      .median(1)
      // Output as high-quality JPEG
      .jpeg({ quality: 95 })
      .toBuffer();
    
    return processedImage;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error('Failed to preprocess image: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Extracts text from an image using Google Vision API
 * @param imageBuffer The image as a buffer
 * @returns The extracted text
 */
export async function extractTextWithVision(imageBuffer: Buffer): Promise<string> {
  try {
    if (!visionClient) {
      console.warn('Vision API client not initialized');
      return '';
    }
    
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.warn('No text detected in image');
      return '';
    }
    
    // The first annotation contains the entire extracted text
    return detections[0].description || '';
  } catch (error) {
    console.error('Error extracting text with Vision API:', error);
    // Return empty string instead of throwing error
    return '';
  }
}

/**
 * Refines the extracted text using Gemini API
 * @param extractedText The raw text extracted from the image
 * @returns The refined text
 */
export async function refineTextWithGemini(extractedText: string): Promise<string> {
  try {
    // Skip refinement if there's no text to refine
    if (!extractedText || !extractedText.trim()) {
      return '';
    }
    
    if (!genAI) {
      console.warn('Gemini API client not initialized, skipping text refinement');
      return extractedText;
    }
    
    // Use Gemini to refine the text
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      You are an expert in Myanmar language OCR correction. I have text extracted from an image using OCR. It contains Myanmar text that may have recognition errors.
            
            Your task:
            1. Fix any Myanmar character combinations and ensure proper Unicode ordering
            2. Correct spacing issues between words
            3. Fix common OCR errors in Myanmar text: 
               - Replace mistaken Latin characters with correct Myanmar equivalents
               - Handle numbers correctly
               - Ensure marks like ‌ေ, ံ, ိ, ီ, ်,  ူ ,  ုetc. are properly combined with base characters
            4. Preserve any intentional English words, numbers, dates, and abbreviations that make sense
            5. Ensure that the text is in the correct Myanmar script and Unicode order
            6. Ensure that the text in Myanmar makes sense and is grammatically correct
            7. Ensure that the text are correctly punctuated and used proper line breaks depending on the context
            8. Ensure that the text is correctly formatted and is easy to read
            9. Please remove any gibberish text that does not make sense

            Output ONLY the corrected text without explanations or comments.
            
      
      Original OCR text:
      ${extractedText}
    `;
    
    // Add timeout handling
    let refinedText = extractedText;
    
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API request timed out')), 30000);
      });
      
      // Start the Gemini API request
      const resultPromise = model.generateContent(prompt);
      
      // Use Promise.race but handle the result correctly
      const result = await Promise.race([
        resultPromise,
        timeoutPromise.then(() => { throw new Error('Gemini API request timed out'); })
      ]);
      
      // Now result is definitely from resultPromise and not timeoutPromise
      const response = await result.response;
      refinedText = response.text().trim();
    } catch (timeoutError) {
      console.error('Error or timeout with Gemini API:', timeoutError);
      return extractedText;
    }
    
    return refinedText;
  } catch (error) {
    console.error('Error refining text with Gemini:', error);
    // Fall back to the original extracted text if Gemini fails
    return extractedText;
  }
}

/**
 * Process image for OCR, using both Google Vision and Gemini
 * @param imageFile The image file to process
 * @param cropData Optional cropping data
 * @returns The extracted and refined text
 */
export async function processImageOCR(
  imageFile: File,
  cropData?: { 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    unit: 'px' | '%';
  }
): Promise<string> {
  try {
    // Step 1: Preprocess the image (if crop data is provided, apply it before preprocessing)
    let imageToProcess: Buffer;
    
    if (cropData) {
      // Apply cropping before preprocessing
      const originalBuffer = await fileToBuffer(imageFile);
      const croppedBuffer = await cropImage(originalBuffer, cropData);
      imageToProcess = await preprocessImage(new File([croppedBuffer], 'cropped.jpg', { type: 'image/jpeg' }));
    } else {
      // No cropping needed, just preprocess
      imageToProcess = await preprocessImage(imageFile);
    }
    
    // Step 2: Extract text using Google Vision
    let extractedText: string;
    try {
      extractedText = await extractTextWithVision(imageToProcess);
    } catch (error) {
      console.error('Vision API extraction failed, returning empty result:', error);
      return '';
    }
    
    // Step 3: Refine the extracted text using Gemini
    let refinedText: string;
    try {
      refinedText = await refineTextWithGemini(extractedText);
    } catch (error) {
      console.warn('Gemini refinement failed, using raw OCR result:', error);
      refinedText = extractedText;
    }
    
    return refinedText;
  } catch (error) {
    console.error('Error in OCR process:', error);
    throw new Error('Failed to process image for OCR: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Crop an image based on the provided crop data
 * @param imageBuffer The image buffer to crop
 * @param cropData The cropping coordinates and dimensions
 * @returns The cropped image as a buffer
 */
async function cropImage(
  imageBuffer: Buffer,
  cropData: { 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    unit: 'px' | '%';
  }
): Promise<Buffer> {
  try {
    const { x, y, width, height, unit } = cropData;
    
    // Load image metadata to get dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 0;
    const imgHeight = metadata.height || 0;
    
    // Calculate actual crop dimensions based on unit
    let cropX = x;
    let cropY = y;
    let cropWidth = width;
    let cropHeight = height;
    
    if (unit === '%') {
      cropX = Math.floor((x / 100) * imgWidth);
      cropY = Math.floor((y / 100) * imgHeight);
      cropWidth = Math.floor((width / 100) * imgWidth);
      cropHeight = Math.floor((height / 100) * imgHeight);
    }
    
    // Extract region
    const croppedBuffer = await sharp(imageBuffer)
      .extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight
      })
      .toBuffer();
      
    return croppedBuffer;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw new Error('Failed to crop image: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Convert a File object to a Buffer
 * @param file The file to convert
 * @returns The file as a Buffer
 */
async function fileToBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const buffer = Buffer.from(reader.result);
        resolve(buffer);
      } else {
        reject(new Error('FileReader did not return an ArrayBuffer'));
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsArrayBuffer(file);
  });
} 