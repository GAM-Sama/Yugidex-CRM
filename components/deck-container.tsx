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
  onCardHover: (card: CardType | null) => void;
  onRemoveCard: (cardId: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent) => void
  isDragOver?: boolean
  isMainDeck?: boolean
}

export function DeckContainer({
  title,
  cards,
  maxCards,
  onCardClick,
  onCardHover,
  onRemoveCard,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver = false,
  isMainDeck = false,
}: DeckContainerProps) {
  const totalCards = cards.reduce((sum, card) => sum + card.deckQuantity, 0)
  
  // --- CAMBIO 1: Lógica para forzar 4 filas (60 slots) en el Main Deck ---
  const emptySlots = isMainDeck 
    ? Math.max(0, 60 - cards.length) 
    : Math.max(0, 15 - cards.length);

  return (
    <div
      className={cn(
        // --- CAMBIO 2: Reducimos el padding vertical de p-3 a p-2 ---
        "bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-2 transition-all duration-200 h-full flex flex-col",
        isDragOver && "ring-2 ring-primary bg-primary/5",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      {/* --- CAMBIO 3: Reducimos el margen inferior del header de mb-2 a mb-1 --- */}
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant={totalCards > maxCards ? "destructive" : "secondary"} className="text-sm">
          {totalCards}/{maxCards}
        </Badge>
      </div>

      {isDragOver && <p className="text-sm text-primary font-medium mb-2">Suelta la carta aquí</p>}

      <div className="flex-1 overflow-y-auto pt-2" onMouseLeave={() => onCardHover(null)}>
        <div className="flex flex-wrap">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="relative group w-[6.66%] p-0.5" 
              onMouseEnter={() => onCardHover(card)}
              onClick={() => onCardClick(card)}
            >
              <div
                className="relative aspect-[2/3] w-full cursor-pointer group-hover:scale-150 group-hover:z-10 transition-transform duration-200 origin-bottom"
              >
                <Image
                  src={card.image_url || "/card-back.png"}
                  alt={card.name}
                  fill
                  className="object-cover"
                  sizes="5vw"
                />
                {card.deckQuantity > 1 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                    {card.deckQuantity}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-0 left-0 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveCard(card.id)
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Slots vacíos con el mismo tamaño */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div key={`empty-${index}`} className="w-[6.66%] p-0.5">
                 <div
                   className={cn(
                     "aspect-[2/3] w-full border border-dashed border-muted-foreground/20 rounded flex items-center justify-center",
                     isDragOver && "border-primary/50 bg-primary/5",
                   )}
                 >
                    <div className="text-muted-foreground/40 text-xs">•</div>
                 </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}