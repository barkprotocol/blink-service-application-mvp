import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ImageIcon } from 'lucide-react'

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must not exceed 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must not exceed 1000 characters'),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png, .webp files are accepted."
    ),
})

type FormValues = z.infer<typeof formSchema>

interface CreateNFTFormProps {
  onSuccess: () => void
}

export function CreateNFTForm({ onSuccess }: CreateNFTFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('image', data.image)

      const response = await fetch('/api/nfts/create', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to create NFT')
      }

      toast({
        title: "Success",
        description: "Your NFT has been created successfully!",
      })
      onSuccess()
      form.reset()
      setPreviewUrl(null)
    } catch (error) {
      console.error('Error creating NFT:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [form, onSuccess])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        form.setError('image', { message: 'Max image size is 5MB.' })
        return
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError('image', { message: 'Only .jpg, .png, .webp files are accepted.' })
        return
      }
      form.setValue('image', file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter NFT name" {...field} aria-describedby="name-description" />
              </FormControl>
              <FormDescription id="name-description">
                Choose a unique name for your NFT.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your NFT"
                  className="resize-none"
                  {...field}
                  aria-describedby="description-info"
                />
              </FormControl>
              <FormDescription id="description-info">
                Provide a detailed description of your NFT.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleImageChange}
                    {...rest}
                    aria-describedby="image-info"
                  />
                  {previewUrl && (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription id="image-info">
                Upload an image for your NFT (max 5MB, .jpg, .png, or .webp).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Create NFT
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

