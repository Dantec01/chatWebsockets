"use client"

import { Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface UsersListProps {
  users: User[]
  currentUserId: string
  isVisible: boolean
  onToggle: () => void
}

export function UsersList({ users, currentUserId, isVisible, onToggle }: UsersListProps) {
  return (
    <>
      {/* Toggle button for mobile/when hidden */}
      {!isVisible && (
        <Button variant="ghost" size="icon" onClick={onToggle} className="fixed left-4 top-4 z-50 md:left-6 md:top-6">
          <Users className="h-5 w-5" />
          <span className="sr-only">Mostrar usuarios</span>
        </Button>
      )}

      {/* Users sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform duration-300 md:relative md:z-0",
          isVisible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-card-foreground">Usuarios</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {users.length}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Ocultar usuarios</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {users.map((user) => {
                const userNumber = user.id.replace("G", "")
                const avatarText = `G${userNumber}`

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      user.id === currentUserId ? "bg-primary/10" : "hover:bg-accent",
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <span className="font-mono text-xs font-medium text-primary">{avatarText}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {user.id}
                        {user.id === currentUserId && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500" title="En línea" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isVisible && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onToggle} />}
    </>
  )
}
