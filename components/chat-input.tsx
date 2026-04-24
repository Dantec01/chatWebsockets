"use client"

import type React from "react"

import { useState, useRef, type ClipboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ImageIcon, X } from "lucide-react"
import Image from "next/image"

interface ChatInputProps {
  onSendMessage: (content: string, image?: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!message.trim() && !imagePreview) return
    if (isLoading) return

    onSendMessage(message, imagePreview || undefined)
    setMessage("")
    setImagePreview(null)
  }

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault()

        const blob = items[i].getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const result = event.target?.result as string
            setImagePreview(result)
          }
          reader.readAsDataURL(blob)
        }
        break
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border-t border-border bg-card p-4 md:p-6">
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <Image src={imagePreview || "/placeholder.svg"} alt="Vista previa" fill className="object-cover" />
          </div>
          <Button
            size="icon"
            variant="destructive"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={removeImage}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
          disabled={isLoading}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="sr-only">Adjuntar imagen</span>
        </Button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          placeholder="Escribe un mensaje..."
          className="min-h-[44px] resize-none bg-background"
          rows={1}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={(!message.trim() && !imagePreview) || isLoading} className="shrink-0">
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar mensaje</span>
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Pega imágenes directamente o usa el botón para cargarlas</p>
    </div>
  )
}
