"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OcrInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-[#333333]"
        title="How to use OCR"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md bg-[#2A2A2A] rounded-lg shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-[#333333]"
            >
              <X className="h-4 w-4" />
            </Button>

            <h3 className="text-xl font-semibold mb-4 text-[#6B8AFF]">
              How to Use OCR
            </h3>

            <div className="space-y-4 text-gray-300">
              <p>
                Extract text from images of Myanmar text using advanced
                OCR technology.
              </p>

              <div>
                <h4 className="font-medium text-white mb-2">Step 1: Upload an Image</h4>
                <p className="text-sm">
                  Click on the upload area or drag and drop an image file
                  containing Burmese text.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Step 2: Crop (Optional)</h4>
                <p className="text-sm">
                  After uploading, you can crop the image to focus on specific
                  text areas. Hover over the image and click the crop icon.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Step 3: Process</h4>
                <p className="text-sm">
                  Click the "Extract" button to extract text from
                  the image.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Technical Details</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>
                    Uses Google Vision API for accurate text extraction
                  </li>
                  <li>
                    Gemini AI refines the extracted text for better accuracy
                  </li>
                  <li>
                    Fallback to Tesseract.js if Google services are unavailable
                  </li>
                  <li>
                    Image preprocessing enhances recognition quality
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Tips for Best Results</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Use clear images with good lighting</li>
                  <li>Crop to include only the text area</li>
                  <li>Avoid extremely low-resolution images</li>
                  <li>
                    For handwriting, ensure it's clearly written and well-spaced
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#6B8AFF] hover:bg-[#5A79EE]"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 