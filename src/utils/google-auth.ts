import { GoogleAuth } from 'google-auth-library';

/**
 * Gets the Google Cloud authentication token
 * @returns A Promise that resolves to the authentication token or null if not available
 */
export async function getGoogleAuthToken(): Promise<string | null> {
  try {
    // Skip if no credentials are configured
    if (!hasGoogleCredentials()) {
      console.warn('Google auth credentials not configured');
      return null;
    }
    
    // Check for application default credentials or service account file
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token || !token.token) {
      console.warn('Failed to obtain Google auth token');
      return null;
    }
    
    return token.token;
  } catch (error) {
    console.error('Error getting Google auth token:', error);
    return null;
  }
}

/**
 * Check if Google auth credentials are properly configured
 * @returns Boolean indicating if credentials are configured
 */
export function hasGoogleCredentials(): boolean {
  try {
    return !!process.env.GOOGLE_APPLICATION_CREDENTIALS && 
           process.env.GOOGLE_APPLICATION_CREDENTIALS !== '';
  } catch (error) {
    console.error('Error checking Google credentials:', error);
    return false;
  }
}

/**
 * Check if Gemini API key is configured
 * @returns Boolean indicating if Gemini API key is configured
 */
export function hasGeminiApiKey(): boolean {
  try {
    return !!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY &&
           process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY !== '';
  } catch (error) {
    console.error('Error checking Gemini API key:', error);
    return false;
  }
} 