import { useCallback, useRef, useState } from "react"

interface UseImageUploadProps {
  onUpload?: (url: string, file?: File) => void
  onRemove?: () => void
}

export function useImageUpload({ onUpload, onRemove }: UseImageUploadProps = {}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFileName(file.name)
      
      if (onUpload) {
        onUpload(url, file)
      }
    },
    [onUpload]
  )

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setFileName(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    
    if (onRemove) {
      onRemove()
    }
  }, [previewUrl, onRemove])

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  }
} 