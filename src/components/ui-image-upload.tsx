"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactCrop, { type Crop as ReactCropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ImagePlus, Upload, Trash2, CropIcon, Check, RefreshCw, Loader2, Zap } from "lucide-react";

interface UIImageUploadProps {
  onTextExtracted: (text: string) => void;
}

function CropButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline"
      className="h-12 w-12 p-0 bg-primary/80 border-primary hover:bg-primary hover:border-primary transition-all duration-200"
    >
      <CropIcon className="h-5 w-5 text-white" />
    </Button>
  );
}

export default function UIImageUpload({ onTextExtracted }: UIImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<ReactCropType>({
    unit: 'px', 
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [completedCrop, setCompletedCrop] = useState<ReactCropType | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [tempCroppedBlob, setTempCroppedBlob] = useState<Blob | null>(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{ width: number, height: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [ocrApplied, setOcrApplied] = useState(false);
  
  // Use the toast hook
  const { toast } = useToast();

  // OCR processing with Google Vision + Gemini
  const processWithVisionAPI = useCallback(async (file: File) => {
    setOcrInProgress(true);
    setErrorMessage(null);
    
    try {
      // Prepare form data for the API request
      const formData = new FormData();
      formData.append('image', file);
      
      // Add crop data if available
      if (completedCrop && imgRef.current) {
        const imageElement = imgRef.current;
        
        // Calculate actual crop coordinates relative to the original image
        const scaleX = imageElement.naturalWidth / imageElement.width;
        const scaleY = imageElement.naturalHeight / imageElement.height;
        
        const cropData = {
          x: completedCrop.x * scaleX,
          y: completedCrop.y * scaleY,
          width: completedCrop.width * scaleX,
          height: completedCrop.height * scaleY
        };
        
        formData.append('cropData', JSON.stringify(cropData));
      }
      
      // Show processing toast
      toast({
        title: 'Processing Image',
        description: 'Extracting text from your image...',
      });
      
      // Call the OCR API with timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`OCR request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Send the extracted text to the parent component
        onTextExtracted(data.text || '');
        
        // Show success toast
        toast({
          title: 'Text Extracted Successfully',
          description: data.text ? 'Text has been extracted' : 'No text was detected in the image.',
          variant: 'success',
        });
        
        // Add this:
        setOcrApplied(true);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Re-throw to be caught by the outer try/catch
      }
    } catch (error) {
      console.error('Error during OCR processing:', error);
      setErrorMessage('Failed to process image with Google Vision API.');
      
      // Show error toast
      toast({
        title: 'OCR Processing Failed',
        description: 'Unable to extract text from the image.',
        variant: 'error',
      });
    } finally {
      setOcrInProgress(false);
    }
  }, [completedCrop, onTextExtracted, toast]);

  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove: originalHandleRemove,
  } = useImageUpload({
    onUpload: async (url) => {
      // Get the file from the input
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        // Don't process immediately, let the user crop first if they want
        // Processing is now triggered by the Process button
      }
    },
  });

  // Custom remove handler that ensures we go back to the initial upload state
  const handleRemove = useCallback(() => {
    // Stop any ongoing processing
    setIsProcessing(false);
    setProgress(0);
    setOcrInProgress(false);
    setOcrApplied(false);
    
    // Call the original remove handler from the hook
    originalHandleRemove();
    
    // Reset cropping state
    setIsCropping(false);
    setTempCroppedBlob(null);
  }, [originalHandleRemove]);

  // Create a function to manually update the preview
  const handleUpdatePreview = useCallback((url: string, file: File) => {
    if (fileInputRef.current) {
      // Create a DataTransfer object to set files
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Set the file input's files
      fileInputRef.current.files = dataTransfer.files;
      
      // Manually call handleFileChange with a fake event
      const fakeEvent = {
        target: {
          files: dataTransfer.files
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(fakeEvent);
    }
  }, [handleFileChange, fileInputRef]);

  // For image crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    
    // Store original image dimensions
    const { naturalWidth, naturalHeight } = e.currentTarget;
    
    // Calculate dimensions that maintain aspect ratio within our max height constraint
    let displayWidth = naturalWidth;
    let displayHeight = naturalHeight;
    
    // If the image is taller than our max height, scale it down
    if (displayHeight > 480) {
      const scaleFactor = 480 / displayHeight;
      displayWidth = Math.floor(displayWidth * scaleFactor);
      displayHeight = 480;
    }
    
    // Store the display dimensions
    setOriginalImageDimensions({ width: displayWidth, height: displayHeight });
    
    // Update the image element size
    e.currentTarget.style.width = `${displayWidth}px`;
    e.currentTarget.style.height = `${displayHeight}px`;
    
    // Set initial crop to full image
    setCrop({
      unit: 'px',
      x: 0,
      y: 0,
      width: displayWidth,
      height: displayHeight
    });
    
    setCompletedCrop({
      unit: 'px',
      x: 0,
      y: 0,
      width: displayWidth,
      height: displayHeight
    });
  };

  // Reset crop to original dimensions
  const handleResetCrop = useCallback(() => {
    if (imgRef.current && originalImageDimensions) {
      const { width, height } = originalImageDimensions;
      
      const newCrop = {
        unit: 'px',
        x: 0,
        y: 0,
        width: width,
        height: height
      } as ReactCropType;
      
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  }, [originalImageDimensions]);

  const getCroppedImage = useCallback((crop: ReactCropType | null, forPreview = false) => {
    if (!crop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Calculate the scaling factor between the displayed image and its natural size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set the canvas size based on the cropped area in the natural image size
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    // Draw only the cropped area to the canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    if (forPreview) {
      return canvas.toDataURL('image/jpeg');
    }

    return canvas;
  }, []);

  const handleCropComplete = useCallback(() => {
    if (!completedCrop) return;

    // Immediately exit crop mode
    setIsCropping(false);

    // Create a cropped preview image
    const croppedImageUrl = getCroppedImage(completedCrop, true);
    if (!croppedImageUrl) return;

    // Create a File object from the canvas
    const canvas = getCroppedImage(completedCrop) as HTMLCanvasElement;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      // Store the blob for use in the effect
      setTempCroppedBlob(blob);
    }, 'image/jpeg');
  }, [completedCrop, getCroppedImage]);

  // Use effect to handle the cropped image after blob is created
  useEffect(() => {
    if (tempCroppedBlob && handleRemove) {
      const processCroppedImage = async () => {
        // Create a new File object
        const file = new File([tempCroppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
        console.log("Created cropped file:", file.name, file.size);
        
        // Clear the temporary blob
        setTempCroppedBlob(null);
        
        // Replace the current preview with the cropped image
        handleRemove();
        
        // Set the new preview URL
        const url = URL.createObjectURL(tempCroppedBlob);
        handleUpdatePreview(url, file);
        
        // Show crop success toast
        toast({
          title: 'Image Cropped',
          description: 'The image has been cropped successfully.',
          variant: 'success',
        });
        
        // Note: We don't automatically process the image anymore
        // The user needs to click the Process button
      };
      
      processCroppedImage();
    }
  }, [tempCroppedBlob, handleRemove, handleUpdatePreview, toast]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setOcrApplied(false); // Reset applied state when a new image is dropped
      console.log("File dropped");

      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        console.log("No valid image file found in drop");
        // Show error toast
        toast({
          title: 'Invalid File',
          description: 'Please upload a valid image file (JPEG or PNG).',
          variant: 'error',
        });
        return;
      }

      console.log("Processing dropped file:", file.name);
      
      try {
        // Create a simple file list to use with the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Clean up previous state if needed
        if (previewUrl) {
          setIsProcessing(false);
          setProgress(0);
          setIsCropping(false);
          setTempCroppedBlob(null);
        }
        
        // Set up the file input and trigger change
        if (fileInputRef.current) {
          // Update the file input element
          fileInputRef.current.files = dataTransfer.files;
          console.log("File input updated with new file:", file.name);
          
          // This creates a new event that better simulates a real file input change
          const event = new Event('change', { bubbles: true });
          fileInputRef.current.dispatchEvent(event);
          
          // Call the handler directly with a proper event object
          handleFileChange({
            target: fileInputRef.current
          } as React.ChangeEvent<HTMLInputElement>);
          
          // Show success toast
          toast({
            title: 'Image Uploaded',
            description: 'Click "Process Image with OCR" to extract text.',
            variant: 'success',
          });
        }
      } catch (error) {
        console.error("Error processing dropped file:", error);
        // Show error toast
        toast({
          title: 'Upload Failed',
          description: 'Failed to process the uploaded image.',
          variant: 'error',
        });
      }
    },
    [previewUrl, handleFileChange, setOcrApplied, toast],
  );

  const handleCropClick = () => {
    setIsCropping(true);
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
  };

  // Add Escape key handler
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCropping) {
        handleCancelCrop();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);
    
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCropping]);

  // Handler for the Process button
  const handleProcessClick = useCallback(() => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    setOcrApplied(false); // Reset applied state when starting a new process
    const file = fileInputRef.current.files[0];
    
    // Show a toast before starting processing
    toast({
      title: 'Starting OCR Process',
      description: 'Using Google Vision API...',
      variant: 'default',
    });
    
    processWithVisionAPI(file);
  }, [processWithVisionAPI, toast]);

  // Create a wrapper for handleThumbnailClick that resets the applied state
  const handleThumbnailClickWithReset = useCallback(() => {
    setOcrApplied(false); // Reset applied state when a new image is selected
    handleThumbnailClick();
  }, [handleThumbnailClick]);

  // Add soft glow to the Process button
  useEffect(() => {
    // Add a class to the body during component mount
    document.body.classList.add('using-crop-tool');
    
    // Add custom style for the process button glow
    const style = document.createElement('style');
    style.innerHTML = `
      .process-button {
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      
      .process-button:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(217, 110, 75, 0.3) 0%, rgba(217, 110, 75, 0) 70%);
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .process-button:hover:before {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Remove the class and style when component unmounts
      document.body.classList.remove('using-crop-tool');
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <div className="w-full mb-8">
        <Input
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {!previewUrl ? (
          <div
            onClick={handleThumbnailClickWithReset}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex h-96 cursor-pointer flex-col items-center justify-center gap-8 rounded-lg border-2 border-dashed border-border bg-card/50 transition-all duration-300 hover:bg-muted hover:border-primary hover:scale-[1.01] hover:shadow-lg",
              isDragging && "border-primary bg-primary/10",
            )}
          >
            <div className="rounded-full bg-orange-50 dark:bg-gray-800 p-6 shadow-md border border-orange-200 dark:border-gray-700">
              <ImagePlus className="h-10 w-10 text-[#D96E4B]" />
            </div>
            
            {isProcessing ? (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-4">Processing... {Math.round(progress)}%</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium">Drag & drop image here or <span className="text-primary">browse</span></p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: JPG, PNG
                </p>
              </div>
            )}
          </div>
        ) : isCropping ? (
          <div className="space-y-4">
            <div className="relative flex justify-center">
              <div className="crop-container">
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => {
                    setCrop(newCrop);
                    setCompletedCrop(newCrop);
                  }}
                  ruleOfThirds
                >
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="crop-preview-image"
                  />
                </ReactCrop>
              </div>
            </div>
            
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Adjust the crop area by dragging the corners
            </div>
            
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button 
                onClick={handleCropComplete}
                className="btn-primary px-6"
              >
                <Check className="h-5 w-5 mr-2" />
                <span>Apply Crop</span>
              </Button>
              <Button 
                onClick={handleResetCrop}
                className="btn-reset px-6"
                title="Reset to full image"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                <span>Reset</span>
              </Button>
              <Button 
                onClick={handleCancelCrop}
                className="btn-outline px-6"
              >
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative flex justify-center">
              <div className="image-preview-container">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="preview-image"
                />
              </div>
            </div>
            
            {/* All buttons aligned in a single row with improved visual styling */}
            <div className="flex justify-center items-center gap-4 mt-6">
              {/* Create consistent button styling */}
              <Button
                onClick={handleThumbnailClickWithReset}
                className="btn-icon btn-outline"
                title="Upload new image"
              >
                <Upload className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleCropClick}
                className="btn-icon btn-outline"
                title="Crop image"
              >
                <CropIcon className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleRemove}
                className="btn-icon btn-danger"
                title="Remove image"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              
              {/* Visual divider */}
              <div className="h-8 w-px bg-border mx-2"></div>
              
              <Button 
                onClick={handleProcessClick}
                disabled={ocrInProgress || ocrApplied}
                className={cn(
                  "btn-primary px-6 process-button",
                  ocrApplied && "bg-green-600 hover:bg-green-700"
                )}
              >
                {ocrInProgress ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : ocrApplied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    <span>Complete</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    <span>Extract</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Error message */}
            {errorMessage && (
              <p className="text-red-500 text-center text-sm mt-3">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Global styles for ReactCrop that are safe to include */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom styles for ReactCrop */
        .ReactCrop__crop-selection {
          border: 3px solid #D96E4B !important; /* Thicker border */
          box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.2) !important; /* Lighter overlay */
        }
        
        .ReactCrop__drag-handle {
          background-color: #D96E4B !important;
          width: 14px !important; /* Larger handles */
          height: 14px !important; /* Larger handles */
          border-radius: 50% !important;
          border: 2px solid white !important; /* White border for better visibility */
        }
        
        /* Ensure all buttons show a pointer cursor */
        button {
          cursor: pointer !important;
        }
        
        /* Fix icon visibility on button hover */
        button:hover svg {
          color: white !important;
        }
      `}} />
    </>
  );
} 