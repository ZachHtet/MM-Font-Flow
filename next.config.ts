/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_AI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
    NEXT_PUBLIC_VISION_API_URL: process.env.NEXT_PUBLIC_VISION_API_URL,
    NEXT_PUBLIC_GEMINI_API_URL: process.env.NEXT_PUBLIC_GEMINI_API_URL,
  },

  output: 'standalone', 
};

export default nextConfig;
