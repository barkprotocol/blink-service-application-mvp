import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageUpload: (image: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (!file) return

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or GIF.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const base64 = event.target.result.split(',')[1]
        onImageUpload(base64)
        setPreview(event.target.result)
        setError(null)
      }
    }
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.')
    }
    reader.readAsDataURL(file)
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': []
    },
    maxFiles: 1,
    multiple: false
  })

  const removeImage = () => {
    setPreview(null)
    onImageUpload('')
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="image">Upload Image</Label>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-auto rounded-md" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-primary">Drop the image here ...</p>
          ) : (
            <div>
              <p className="text-lg font-semibold mb-2">Drag 'n' drop an image here, or click to select one</p>
              <p className="text-sm text-muted-foreground">Supports: JPEG, PNG, GIF (Max 5MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

