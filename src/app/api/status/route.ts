import { NextRequest, NextResponse } from 'next/server';
import { hasGoogleCredentials, hasGeminiApiKey } from '@/utils/google-auth';

export async function GET(request: NextRequest) {
  try {
    // Check if Google Vision API is configured
    const googleVisionConfigured = hasGoogleCredentials();
    
    // Check if Gemini API is configured
    const geminiConfigured = hasGeminiApiKey();
    
    return NextResponse.json({
      googleVisionConfigured,
      geminiConfigured
    });
  } catch (error) {
    console.error('Error checking API status:', error);
    return NextResponse.json(
      { error: 'Failed to check API status' },
      { status: 500 }
    );
  }
} 