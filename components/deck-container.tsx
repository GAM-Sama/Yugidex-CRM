"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Minus } from "lucide-react"
import Image from "next/image"
import type { Card as CardType } from "@/types/card"
import { cn } from "@/lib/utils"

interface DeckCard extends CardType {
  deckQuantity: number
}

interface DeckContainerProps {
  title: string
  cards: DeckCard[]
  maxCards: number
  onCardClick: (card: CardType) => void
  onRemoveCard: (cardId: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent) => void
  isDragOver?: boolean
  gridCols?: number
  isMainDeck?: boolean
}

export function DeckContainer({
  title,
  cards,
  maxCards,
  onCardClick,
  onRemoveCard,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver = false,
  gridCols = 5,
  isMainDeck = false,
}: DeckContainerProps) {
  const totalCards = cards.reduce((sum, card) => sum + card.deckQuantity, 0)

  const visibleSlots = isMainDeck ? 40 : 15 // Show fixed number of slots for visual consistency
  const emptySlots = Math.max(0, visibleSlots - cards.length)

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all duration-200 h-full flex flex-col",
        isDragOver && "ring-2 ring-primary bg-primary/5 scale-[1.01]",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant={totalCards > maxCards ? "destructive" : "secondary"} className="text-sm">
          {totalCards}/{maxCards}
        </Badge>
      </div>

      {isDragOver && <p className="text-sm text-primary font-medium mb-2">Suelta la carta aquí</p>}

      <div className="flex-1 overflow-hidden">
        <div
          className={cn(
            "grid gap-1 h-full",
            `grid-cols-${gridCols}`,
            isMainDeck ? "auto-rows-max overflow-y-auto" : "auto-rows-max",
          )}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          {/* Render actual cards */}
          {cards.map((card) => (
            <div key={card.id} className="relative group">
              <div
                className="relative aspect-[2/3] w-full bg-gradient-to-br from-primary/10 to-accent/10 rounded cursor-pointer hover:scale-105 hover:z-10 transition-all duration-200"
                onClick={() => onCardClick(card)}
              >
                <Image
                  src={card.image_url || "/placeholder.svg?height=300&width=200&query=Yu-Gi-Oh card back"}
                  alt={card.name}
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 768px) 10vw, 5vw"
                />
                {card.deckQuantity > 1 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                    {card.deckQuantity}
                  </div>
                )}
              </div>

              {/* Remove button - shows on hover */}
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-1 -left-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveCard(card.id)
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Render empty slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className={cn(
                "aspect-[2/3] w-full border border-dashed border-muted-foreground/20 rounded flex items-center justify-center transition-colors",
                isDragOver && "border-primary/50 bg-primary/5",
              )}
            >
              <div className="text-muted-foreground/40 text-xs">•</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
