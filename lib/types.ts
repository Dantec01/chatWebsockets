export interface Message {
  id: string
  userId: string
  content: string
  image?: string
  timestamp: string
}

export interface User {
  id: string
  lastActive: string
}
