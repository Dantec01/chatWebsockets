"use client"

import type React from "react"

import { useState, useRef, type ClipboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, X, FileText } from "lucide-react"
import Image from "next/image"

interface ChatInputProps {
  onSendMessage: (content: string, file?: File) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return
    if (isLoading) return

    onSendMessage(message, selectedFile || undefined)
    setMessage("")
    setSelectedFile(null)
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        e.preventDefault()
        const blob = items[i].getAsFile()
        if (blob) {
          handleFileSelection(blob)
        }
        break
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelection(file)
    }
  }

  const handleFileSelection = (file: File) => {
    setSelectedFile(file)
    if (filePreview) URL.revokeObjectURL(filePreview)

    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file))
    } else {
      setFilePreview(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border-t border-border bg-card p-4 md:p-6">
      {selectedFile && (
        <div className="mb-3 relative inline-flex items-center bg-muted/50 rounded-lg p-2 pr-8 border border-border">
          {filePreview ? (
            <div className="relative h-16 w-16 overflow-hidden rounded border border-border">
              <Image src={filePreview || "/placeholder.svg"} alt="Vista previa" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {selectedFile.name}
              </span>
            </div>
          )}
          <Button
            size="icon"
            variant="destructive"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-sm"
            onClick={removeFile}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="*/*" className="hidden" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
          disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Adjuntar archivo</span>
        </Button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          placeholder="Escribe un mensaje..."
          className="min-h-[44px] resize-none bg-background shadow-sm"
          rows={1}
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend} 
          disabled={(!message.trim() && !selectedFile) || isLoading} 
          className="shrink-0 relative overflow-hidden"
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          ) : null}
          <Send className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
          <span className="sr-only">Enviar mensaje</span>
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Pega archivos directamente o usa el botón para cargarlos</p>
    </div>
  )
}
