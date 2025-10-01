"use client"

import type { Card } from "@/types/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface DeckCardPreviewProps {
  card: Card | null
}

export function DeckCardPreview({ card }: DeckCardPreviewProps) {
  if (!card) {
    return (
      <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg h-full flex items-center justify-center">
        <p className="text-muted-foreground text-center text-sm">Selecciona una carta para ver sus detalles</p>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Monster":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300"
      case "Spell":
        return "bg-green-500/20 text-green-700 dark:text-green-300"
      case "Trap":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 h-full flex flex-col">
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-balance mb-2 leading-tight">{card.name}</h2>
        <div className="flex flex-wrap gap-1">
          <Badge className={getTypeColor(card.card_type)} size="sm">
            {card.card_type}
          </Badge>
          {card.rarity && (
            <Badge variant="outline" size="sm">
              {card.rarity}
            </Badge>
          )}
        </div>
      </div>

      <div className="relative aspect-[2/3] w-full max-w-[200px] mx-auto mb-3 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex-shrink-0">
        <Image
          src={card.image_url || "/placeholder.svg?height=600&width=400&query=Yu-Gi-Oh card back"}
          alt={card.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {card.card_type === "Monster" && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {card.monster_type && (
              <div>
                <span className="font-medium text-muted-foreground">Tipo:</span>
                <div className="text-foreground">{card.monster_type}</div>
              </div>
            )}
            {card.attribute && (
              <div>
                <span className="font-medium text-muted-foreground">Atributo:</span>
                <div className="text-foreground">{card.attribute}</div>
              </div>
            )}
            {card.level_rank_link && (
              <div>
                <span className="font-medium text-muted-foreground">Nivel:</span>
                <div className="text-foreground">{card.level_rank_link}</div>
              </div>
            )}
            {card.atk !== null && card.def !== null && (
              <div>
                <span className="font-medium text-muted-foreground">ATK/DEF:</span>
                <div className="text-foreground font-bold">
                  {card.atk}/{card.def}
                </div>
              </div>
            )}
          </div>
        )}

        {card.card_icon && (
          <div className="text-xs">
            <span className="font-medium text-muted-foreground">Tipo: </span>
            <span className="text-foreground">{card.card_icon}</span>
          </div>
        )}

        {card.description && (
          <div className="border-t border-border/50 pt-2">
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Efecto:</h4>
            <p className="text-xs text-foreground text-pretty leading-relaxed bg-muted/30 p-2 rounded">
              {card.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
