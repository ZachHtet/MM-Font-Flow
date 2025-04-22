import { NextRequest, NextResponse } from 'next/server';

// Base URL for Vision API
const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";
const API_KEY = process.env.GOOGLE_VISION_API_KEY;
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;

// This function will handle the direct API call to Google Vision
export async function analyzeImageWithVision(imageBuffer: Buffer): Promise<string> {
  try {
    // First check if API key is present
    if (!API_KEY) {
      console.error('Vision API key not configured');
      return '';
    }
    
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Create the request body according to Google Vision API requirements
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ["my"] // Myanmar language hint
          }
        }
      ]
    };
    
    // Construct the URL with your API key
    const url = `${VISION_API_URL}?key=${API_KEY}`;
    
    // Make the request to Google Vision API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vision API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      // Extract the text from the response
      if (data.responses && 
          data.responses[0] && 
          data.responses[0].textAnnotations && 
          data.responses[0].textAnnotations.length > 0) {
        return data.responses[0].textAnnotations[0].description;
      }
      
      return '';
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error in server-side Vision API call:', error);
    // Return empty string instead of throwing error to prevent server crashes
    return '';
  }
}