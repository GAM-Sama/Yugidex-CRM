"use client"

import type { Card } from "@/types/card"
import { Card as UICard, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CardGridProps {
  cards: Card[]
  selectedCard: Card | null
  onCardSelect: (card: Card) => void
}

export function CardGrid({ cards, selectedCard, onCardSelect }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <UICard className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No se encontraron cartas</p>
            <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </CardContent>
      </UICard>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold">Cartas ({cards.length})</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 pr-2">
        {cards.map((card) => (
          <UICard
            key={card.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-card/80 backdrop-blur-sm",
              selectedCard?.id === card.id && "ring-2 ring-primary shadow-lg scale-105",
            )}
            onClick={() => onCardSelect(card)}
          >
            <CardContent className="p-2">
              <div className="relative aspect-[2/3] w-full mb-2">
                <Image
                  src={card.image_url || "/card-back.png"}
                  alt={card.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
                {card.quantity > 1 && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                    x{card.quantity}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-medium text-xs text-balance leading-tight line-clamp-2">{card.name}</h4>
                
                {/* --- INICIO MODIFICACIÓN --- */}
                {card.card_type === "Monster" ? (
                  <p className="text-xs text-muted-foreground">
                    ATK: {card.atk ?? '?'} / DEF: {card.def ?? '?'}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground capitalize">
                    {card.card_icon}
                  </p>
                )}
                {/* --- FIN DE LA MODIFICACIÓN --- */}

              </div>
            </CardContent>
          </UICard>
        ))}
      </div>
    </div>
  )
}