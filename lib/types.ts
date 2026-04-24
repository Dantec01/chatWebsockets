export interface Message {
  id: string
  userId: string
  content: string
  image?: string
  file?: { url: string; name: string; type: string; path?: string; size?: number }
  timestamp: string
}

export interface User {
  id: string
  lastActive: string
}
