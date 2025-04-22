"use client";

import { Upload } from "lucide-react";

interface UploadAreaProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  supportedFormats?: string;
}

export function UploadArea({
  isDragging,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClick,
  supportedFormats = "JPG, PNG"
}: UploadAreaProps) {
  return (
    <div
      className={`relative w-full aspect-video md:aspect-auto md:h-72 rounded-lg border-2 border-dashed 
      ${isDragging ? "border-blue-500 bg-blue-500/5" : "border-gray-700 bg-gray-900/50"} 
      flex flex-col items-center justify-center p-6 transition-all duration-200 ease-in-out cursor-pointer`}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
          <Upload className="h-6 w-6 text-blue-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Drag & drop image here or <span className="text-blue-500">browse</span></p>
          <p className="text-sm text-muted-foreground">Supported formats: {supportedFormats}</p>
        </div>
      </div>
    </div>
  );
} 