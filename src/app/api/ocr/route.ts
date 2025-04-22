import { NextRequest, NextResponse } from 'next/server';
import { refineTextWithGemini } from '@/utils/image-processing';
import { analyzeImageWithVision } from '@/utils/server-vision';
import { hasGeminiApiKey } from '@/utils/google-auth';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    // Check if Vision API key is configured
    if (!process.env.GOOGLE_VISION_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Google Vision API key not configured.',
          text: '' // Return empty text so the app can continue functioning
        },
        { status: 200 } // Return 200 to prevent server errors
      );
    }

    // Check if Gemini API key is configured
    if (!hasGeminiApiKey()) {
      console.warn('Gemini API key not configured. Text refinement will be skipped.');
    }

    // Parse multipart form data
    let contentType;
    try {
      contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return NextResponse.json(
          { 
            error: 'Invalid content type. Must be multipart/form-data',
            text: '' 
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('Error parsing content type:', error);
      return NextResponse.json({ error: 'Failed to parse content type', text: '' }, { status: 200 });
    }

    // Parse form data with error handling
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json({ error: 'Failed to parse form data', text: '' }, { status: 200 });
    }
    
    const imageFile = formData.get('image') as File | null;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided', text: '' }, { status: 200 });
    }
    
    // Get crop data if it exists
    const cropDataStr = formData.get('cropData') as string | null;
    let cropData = null;
    if (cropDataStr) {
      try {
        cropData = JSON.parse(cropDataStr);
      } catch (e) {
        console.warn('Failed to parse crop data:', e);
      }
    }

    // Convert the File to a Buffer with error handling
    let originalBuffer;
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      originalBuffer = Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error converting file to buffer:', error);
      return NextResponse.json({ error: 'Failed to process image file', text: '' }, { status: 200 });
    }
    
    // Process the image based on whether cropping is needed
    let processedImage: Buffer;
    
    try {
      if (cropData && typeof cropData === 'object') {
        const { x, y, width, height } = cropData;
        
        try {
          // First crop the image if needed
          const sharpInstance = sharp(originalBuffer);
          const croppedImage = await sharpInstance
            .extract({
              left: Math.floor(x),
              top: Math.floor(y),
              width: Math.floor(width),
              height: Math.floor(height)
            })
            .toBuffer();
          
          // Then apply preprocessing to the cropped image
          const enhancedImage = await sharp(croppedImage)
            .grayscale()
            .normalize()
            .sharpen()
            .median(1)
            .jpeg({ quality: 95 })
            .toBuffer();
          
          processedImage = enhancedImage;
        } catch (e) {
          console.error('Error processing image:', e);
          // Fall back to processing the original image without cropping
          processedImage = await sharp(originalBuffer)
            .grayscale()
            .normalize()
            .sharpen()
            .median(1)
            .jpeg({ quality: 95 })
            .toBuffer();
        }
      } else {
        // No cropping needed, just preprocess the original image
        processedImage = await sharp(originalBuffer)
          .grayscale()
          .normalize()
          .sharpen()
          .median(1)
          .jpeg({ quality: 95 })
          .toBuffer();
      }
    } catch (error) {
      console.error('Error during image processing with sharp:', error);
      // If sharp processing fails, use the original image
      processedImage = originalBuffer;
    }
    
    // Extract text using our server-side Vision API handler
    let extractedText = '';
    try {
      extractedText = await analyzeImageWithVision(processedImage);
    } catch (error) {
      console.error('Vision API extraction failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to extract text from image.',
          text: '' // Return empty text so client can fallback to local OCR
        },
        { status: 200 }
      );
    }
    
    // Refine text with Gemini API if configured
    let refinedText = extractedText;
    if (extractedText.trim() && hasGeminiApiKey()) {
      try {
        refinedText = await refineTextWithGemini(extractedText);
      } catch (error) {
        console.error('Error refining text with Gemini:', error);
        // Continue with the original extracted text if refinement fails
      }
    }

    // Return the extracted and refined text
    return NextResponse.json({ text: refinedText });
  } catch (error) {
    console.error('Error processing OCR request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        text: '' // Return empty text so client can fallback to local OCR
      },
      { status: 200 }
    );
  }
}

// Set larger payload size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};