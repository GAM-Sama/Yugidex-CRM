"use client"

import type React from "react" // Importa React para usar React.DragEvent
import type { Card } from "@/types/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn, getCardGlowStyle } from "@/lib/utils"
import { FlippableCard } from "@/components/ui/flippable-card"

interface DeckCardGridProps {
  cards: Card[]
  selectedCard: Card | null
  onCardSelect: (card: Card) => void
  onCardAdd: (card: Card) => void
  // --- CORRECCIÓN: La firma de onDragStart ahora incluye React.DragEvent ---
  onDragStart?: (e: React.DragEvent, card: Card) => void
  onDragEnd?: () => void
  onCardHover?: (card: Card | null) => void
  deck?: {
    mainDeck: Array<{ id: string; deckQuantity: number }>
    extraDeck: Array<{ id: string; deckQuantity: number }>
    sideDeck: Array<{ id: string; deckQuantity: number }>
  }
  isListView?: boolean
}

export function DeckCardGrid({
  cards,
  selectedCard,
  onCardSelect,
  onCardAdd,
  onDragStart,
  onDragEnd,
  onCardHover,
  deck,
  isListView = false,
}: DeckCardGridProps) {
  
  const getTotalCopiesInDeck = (cardId: string) => {
    if (!deck) return 0
    const mainCopies = deck.mainDeck.find((c) => c.id === cardId)?.deckQuantity || 0
    const extraCopies = deck.extraDeck.find((c) => c.id === cardId)?.deckQuantity || 0
    const sideCopies = deck.sideDeck.find((c) => c.id === cardId)?.deckQuantity || 0
    return mainCopies + extraCopies + sideCopies
  }

  const canAddCard = (card: Card) => {
    const totalCopies = getTotalCopiesInDeck(card.id)
    return totalCopies < 3 && totalCopies < card.quantity
  }

  if (cards.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No se encontraron cartas</p>
          <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold">Cartas ({cards.length})</h3>
        <p className="text-xs text-muted-foreground">Arrastra o + para agregar</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isListView ? (
          <div className="space-y-1">
            {cards.map((card) => {
              const totalCopiesInDeck = getTotalCopiesInDeck(card.id)
              const canAdd = canAddCard(card)

              return (
                <div
                  key={card.id}
                  style={getCardGlowStyle(card)}
                  className={cn(
                    "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                    selectedCard?.id === card.id && "bg-primary/10 ring-1 ring-primary",
                    !canAdd && "opacity-50 grayscale",
                    "mx-1"
                  )}
                  onClick={() => onCardSelect(card)}
                  onMouseEnter={() => onCardHover?.(card)}
                  onMouseLeave={() => onCardHover?.(null)}
                  draggable={canAdd}
                  onDragStart={(e) => canAdd && onDragStart?.(e, card)}
                  onDragEnd={onDragEnd}
                >
                  <div className="relative w-12 aspect-[59/86] flex-shrink-0">
                    <FlippableCard card={card} />
                    {totalCopiesInDeck > 0 && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg z-10">
                        {totalCopiesInDeck}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{card.name}</h4>
                        {card.card_type === "Monster" && card.atk !== null ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            ATK: {card.atk} / DEF: {card.def}
                          </div>
                        ) : (card.card_type === "Spell" || card.card_type === "Trap") && card.card_icon ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            {card.card_icon}
                          </div>
                        ) : null}
                        <div className="text-xs text-muted-foreground mt-1">Disponibles: {card.quantity}</div>
                      </div>
                      <Button
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0 ml-2 flex-shrink-0",
                          canAdd ? "bg-primary hover:bg-primary/90" : "bg-gray-400 cursor-not-allowed",
                        )}
                        disabled={!canAdd}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (canAdd) {
                            onCardAdd(card)
                          }
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {!canAdd && (
                    <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none">
                      <div className="bg-red-500 text-white text-xs px-1 py-0.5 font-bold">LÍMITE</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {cards.map((card) => {
              const totalCopiesInDeck = getTotalCopiesInDeck(card.id)
              const canAdd = canAddCard(card)

              return (
                <div key={card.id} style={getCardGlowStyle(card)} className="relative group">
                  <div
                    className={cn(
                      "relative aspect-[2/3] cursor-pointer transition-all duration-200 bg-transparent",
                      selectedCard?.id === card.id && "ring-2 ring-primary",
                      !canAdd && "opacity-50 grayscale",
                    )}
                    onClick={() => onCardSelect(card)}
                    onMouseEnter={() => onCardHover?.(card)}
                    onMouseLeave={() => onCardHover?.(null)}
                    draggable={canAdd}
                    onDragStart={(e) => canAdd && onDragStart?.(e, card)}
                    onDragEnd={onDragEnd}
                  >
                    <FlippableCard card={card} />
                    {card.quantity > 1 && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg z-10">
                        {card.quantity}
                      </div>
                    )}
                    {totalCopiesInDeck > 0 && (
                      <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-lg z-10">
                        {totalCopiesInDeck}
                      </div>
                    )}
                    {!canAdd && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <div className="bg-red-500 text-white text-xs px-1 py-0.5 font-bold">LÍMITE</div>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className={cn(
                      "absolute top-1 left-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10",
                      canAdd ? "bg-primary hover:bg-primary/90" : "bg-gray-400 cursor-not-allowed",
                    )}
                    disabled={!canAdd}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (canAdd) {
                        onCardAdd(card)
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}