"use client"

import { useState, useEffect, useRef } from "react"
import { ChatHeader } from "./chat-header"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { UsersList } from "./users-list"
import type { Message, User } from "@/lib/types"
import { createClient } from "@/lib/supabase"

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string>("")
  const [users, setUsers] = useState<User[]>([])
  const [showUsers, setShowUsers] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const initializeUser = async () => {
      try {
        let storedUserId = localStorage.getItem("chat-user-id")

        if (storedUserId && storedUserId.startsWith("guest")) {
          localStorage.removeItem("chat-user-id")
          storedUserId = null
        }

        if (!storedUserId) {
          const { data: existingUsers, error } = await supabase
            .from("active_users")
            .select("user_id")
            .order("user_id", { ascending: true })

          if (error) {
            console.error("[v0] Error al obtener usuarios:", error)
            return
          }

          const userNumbers = (existingUsers || [])
            .map((u) => {
              const match = u.user_id.match(/^G(\d+)$/)
              return match ? Number.parseInt(match[1]) : 0
            })
            .filter((n) => n > 0)
            .sort((a, b) => a - b)

          let newNumber = 1
          for (const num of userNumbers) {
            if (num === newNumber) {
              newNumber++
            } else {
              break
            }
          }

          storedUserId = `G${newNumber}`
          localStorage.setItem("chat-user-id", storedUserId)
        }

        setUserId(storedUserId)

        const { error: upsertError } = await supabase.from("active_users").upsert(
          {
            user_id: storedUserId,
            last_active: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        )

        if (upsertError) {
          console.error("[v0] Error al registrar usuario:", upsertError)
        }
      } catch (error) {
        console.error("[v0] Error en inicialización de usuario:", error)
      }
    }

    initializeUser()
  }, [])

  useEffect(() => {
    if (!userId) return

    const loadInitialData = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("[v0] Error al cargar mensajes:", messagesError)
          return
        }

        if (messagesData) {
          setMessages(
            messagesData.map((msg) => ({
              id: msg.id,
              userId: msg.user_id,
              content: msg.content || "",
              image: msg.image_url || undefined,
              timestamp: msg.created_at,
            })),
          )
        }

        await loadActiveUsers()
      } catch (error) {
        console.error("[v0] Error en carga inicial:", error)
      }
    }

    loadInitialData()

    const messagesChannel = supabase
      .channel("public:messages", {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            userId: payload.new.user_id,
            content: payload.new.content || "",
            image: payload.new.image_url || undefined,
            timestamp: payload.new.created_at,
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[v0] Error en canal de mensajes")
        }
      })

    const usersChannel = supabase
      .channel("public:active_users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_users",
        },
        () => {
          loadActiveUsers()
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[v0] Error en canal de usuarios")
        }
      })

    const activityInterval = setInterval(async () => {
      try {
        await supabase.from("active_users").upsert(
          {
            user_id: userId,
            last_active: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        )
      } catch (error) {
        console.error("[v0] Error al actualizar actividad:", error)
      }
    }, 30000)

    const handleBeforeUnload = async () => {
      try {
        await supabase.from("active_users").delete().eq("user_id", userId)
        localStorage.removeItem("chat-user-id")
      } catch (error) {
        console.error("[v0] Error en desconexión:", error)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      messagesChannel.unsubscribe()
      usersChannel.unsubscribe()
      clearInterval(activityInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      supabase.from("active_users").delete().eq("user_id", userId)
    }
  }, [userId])

  const loadActiveUsers = async () => {
    try {
      const { data, error } = await supabase.from("active_users").select("*").order("user_id", { ascending: true })

      if (error) {
        console.error("[v0] Error al cargar usuarios activos:", error)
        return
      }

      if (data) {
        setUsers(
          data.map((u) => ({
            id: u.user_id,
            lastActive: u.last_active,
          })),
        )
      }
    } catch (error) {
      console.error("[v0] Error en carga de usuarios:", error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (content: string, imageBase64?: string) => {
    setIsLoading(true)

    // Convert Base64 back to a file if there's an image
    let imageUrl = null;
    if (imageBase64) {
      try {
        const response = await fetch(imageBase64);
        const blob = await response.blob();
        
        // Generate a unique filename using timestamp and random string
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
        
        // Compress standard before upload to save space (since limit is 50MB)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: false
          });
          
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      } catch (err: any) {
        console.error("[Chat] Error uploading image:", err);
        alert(`Error al subir la imagen. Detalle: ${err.message || "Desconocido"}`);
        setIsLoading(false);
        return; // Don't send the message if image upload fails
      }
    }

    const { error: msgError } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        content: content || null,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      })
      .select()

    if (msgError) {
      console.error("[v0] Error al enviar mensaje:", msgError)
    }

    setIsLoading(false)
  }

  const handleClearChat = async () => {
    const { error } = await supabase.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      console.error("[v0] Error al limpiar chat:", error)
    } else {
      setMessages([])
    }
  }

  const handleExportPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Historial de Chat", 20, 20)

    doc.setFontSize(10)
    let yPosition = 35
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    const maxWidth = pageWidth - 2 * margin

    for (const message of messages) {
      const date = new Date(message.timestamp)
      const tokyoTime = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      const timeString = tokyoTime.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      })

      const dateString = tokyoTime.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })

      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFont("helvetica", "bold")
      doc.text(`${message.userId} - ${dateString} ${timeString}`, 20, yPosition)
      yPosition += 6

      doc.setFont("helvetica", "normal")
      if (message.content) {
        const lines = doc.splitTextToSize(message.content, maxWidth)
        doc.text(lines, 20, yPosition)
        yPosition += lines.length * 5
      }

      if (message.image) {
        try {
          const imgHeight = 60
          if (yPosition + imgHeight > pageHeight - margin) {
            doc.addPage()
            yPosition = 20
          }

          doc.addImage(message.image, "JPEG", 20, yPosition, 80, imgHeight, undefined, "FAST")
          yPosition += imgHeight + 5
        } catch (error) {
          console.error("[v0] Error al agregar imagen al PDF:", error)
          doc.setFontSize(8)
          doc.text("[Error al cargar imagen]", 20, yPosition)
          yPosition += 5
          doc.setFontSize(10)
        }
      }

      yPosition += 5
    }

    doc.save("chat-historial.pdf")
  }

  return (
    <div className="flex h-full flex-col bg-background md:flex-row">
      <UsersList users={users} currentUserId={userId} isVisible={showUsers} onToggle={() => setShowUsers(!showUsers)} />

      <div className="flex flex-1 flex-col">
        <ChatHeader userId={userId} onClearChat={handleClearChat} onExportPDF={handleExportPDF} />
        <ChatMessages messages={messages} currentUserId={userId} messagesEndRef={messagesEndRef} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
