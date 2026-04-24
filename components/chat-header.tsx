"use client"

import { Moon, Sun, Trash2, Download } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ChatHeaderProps {
  userId: string
  onClearChat: () => void
  onExportPDF: () => void
}

export function ChatHeader({ userId, onClearChat, onExportPDF }: ChatHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userNumber = userId.replace("G", "")
  const avatarText = `G${userNumber}`

  if (!mounted) {
    return (
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="font-mono text-sm font-medium text-primary">{avatarText}</span>
          </div>
          <div>
            <h1 className="text-balance font-semibold text-card-foreground">Chat</h1>
            <p className="text-xs text-muted-foreground">{userId}</p>
          </div>
        </div>
        <div className="h-9 w-9" />
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="font-mono text-sm font-medium text-primary">{avatarText}</span>
        </div>
        <div>
          <h1 className="text-balance font-semibold text-card-foreground">Chat</h1>
          <p className="text-xs text-muted-foreground">{userId}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onExportPDF} className="h-9 w-9" title="Exportar chat a PDF">
          <Download className="h-4 w-4" />
          <span className="sr-only">Exportar a PDF</span>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" title="Limpiar chat">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Limpiar chat</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Limpiar todo el chat?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los mensajes del chat. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onClearChat}>Limpiar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>
    </header>
  )
}
