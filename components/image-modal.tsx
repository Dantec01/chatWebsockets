"use client"

import type React from "react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)))
  }

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
      ;(imageRef.current as any).initialPinchDistance = distance
      ;(imageRef.current as any).initialScale = scale
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && (imageRef.current as any).initialPinchDistance) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
      const scaleChange = distance / (imageRef.current as any).initialPinchDistance
      const newScale = (imageRef.current as any).initialScale * scaleChange
      setScale(Math.max(0.5, Math.min(5, newScale)))
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(5, prev + 0.25))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden border-0">
        <div className="relative w-full h-[95vh] flex items-center justify-center bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 rounded-lg p-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <div className="flex items-center justify-center min-w-[60px] text-white text-sm font-medium">
              {Math.round(scale * 100)}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleZoomIn}
              disabled={scale >= 5}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleReset}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          <div
            ref={imageRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              className="relative"
            >
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="Imagen ampliada"
                width={1200}
                height={1200}
                className="object-contain w-auto h-auto max-w-[90vw] max-h-[85vh] select-none"
                quality={100}
                draggable={false}
              />
            </div>
          </div>

          <div className="absolute top-4 left-4 z-20 text-white text-xs bg-black/60 rounded-lg p-2 max-w-[200px]">
            <p>• Doble clic: Zoom 2x</p>
            <p>• Scroll: Zoom in/out</p>
            <p>• Arrastrar: Mover imagen</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
