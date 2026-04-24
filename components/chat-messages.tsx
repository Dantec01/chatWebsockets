"use client"

import type React from "react"
import { useState } from "react"
import type { Message } from "@/lib/types"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Copy, Check } from "lucide-react"
import { ImageModal } from "./image-modal"
import Tesseract from "tesseract.js"

interface ChatMessagesProps {
  messages: Message[]
  currentUserId: string
  messagesEndRef: React.RefObject<HTMLDivElement>
}

function getUserColor(userId: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-cyan-500",
  ]

  const match = userId.match(/^G(\d+)$/)
  const userNumber = match ? Number.parseInt(match[1]) : 1
  return colors[(userNumber - 1) % colors.length]
}

export function ChatMessages({ messages, currentUserId, messagesEndRef }: ChatMessagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [extractingText, setExtractingText] = useState<string | null>(null)
  const [extractedTexts, setExtractedTexts] = useState<Record<string, string>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const handleExtractText = async (messageId: string, imageUrl: string) => {
    setExtractingText(messageId)
    try {
      const result = await Tesseract.recognize(imageUrl, "spa+eng", {
        logger: (m) => console.log("[v0] OCR progress:", m),
      })
      setExtractedTexts((prev) => ({ ...prev, [messageId]: result.data.text }))
    } catch (error) {
      console.error("[v0] Error al extraer texto:", error)
      setExtractedTexts((prev) => ({ ...prev, [messageId]: "Error al extraer texto de la imagen" }))
    } finally {
      setExtractingText(null)
    }
  }

  const handleCopyText = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("[v0] Error al copiar texto:", error)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-center text-sm text-muted-foreground">No hay mensajes aún. ¡Envía el primero!</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {messages.map((message) => {
          const date = new Date(message.timestamp)
          const tokyoTime = new Date(date.getTime() + 9 * 60 * 60 * 1000)
          const time = tokyoTime.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          })

          let displayUserId = message.userId
          let avatarText = message.userId

          if (message.userId.startsWith("guest")) {
            const userNumber = message.userId.replace("guest", "")
            displayUserId = `G${userNumber}`
            avatarText = `G${userNumber}`
          } else if (message.userId.startsWith("G")) {
            const userNumber = message.userId.replace("G", "")
            avatarText = `G${userNumber}`
            displayUserId = message.userId
          }

          const userColor = getUserColor(displayUserId)

          return (
            <div key={message.id} className="flex flex-row-reverse gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="font-mono text-xs font-medium text-primary">{avatarText}</span>
              </div>
              <div className="flex max-w-[70%] flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{displayUserId}</span>
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>
                <div className={`rounded-lg ${userColor} px-4 py-2 text-white`}>
                  {message.image && (
                    <div className="mb-2 space-y-2">
                      <div
                        className="overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(message.image!)}
                      >
                        <Image
                          src={message.image || "/placeholder.svg"}
                          alt="Imagen compartida"
                          width={300}
                          height={300}
                          className="h-auto w-full object-cover"
                          quality={100}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleExtractText(message.id, message.image!)}
                        disabled={extractingText === message.id}
                      >
                        {extractingText === message.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Extrayendo texto...
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 mr-2" />
                            Extraer texto (OCR)
                          </>
                        )}
                      </Button>
                      {extractedTexts[message.id] && (
                        <div className="bg-white/10 rounded p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">Texto extraído:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-white hover:bg-white/20"
                              onClick={() => handleCopyText(message.id, extractedTexts[message.id])}
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copiar
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{extractedTexts[message.id]}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {message.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      {selectedImage && (
        <ImageModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageUrl={selectedImage} />
      )}
    </>
  )
}
