"use client"

import type { Card } from "@/types/card"
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface CardDetailPanelProps {
  card: Card | null
}

export function CardDetailPanel({ card }: CardDetailPanelProps) {
  if (!card) {
    return (
      <UICard className="border-0 shadow-xl bg-card/80 backdrop-blur-sm h-full">
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Selecciona una carta para ver sus detalles</p>
        </CardContent>
      </UICard>
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Ultra Rare":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
      case "Super Rare":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300"
      case "Rare":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300"
      case "Common":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <UICard className="border-0 shadow-xl bg-card/80 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="text-xl text-balance">{card.name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge className={getTypeColor(card.card_type)}>{card.card_type}</Badge>
          {card.rarity && <Badge className={getRarityColor(card.rarity)}>{card.rarity}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Card Image */}
        <div className="relative aspect-[2/3] w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
          <Image
            src={card.image_url || "/placeholder.svg?height=600&width=400&query=Yu-Gi-Oh card back"}
            alt={card.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <Separator />

        {/* Card Details */}
        <div className="space-y-3">
          {/* Icono Carta */}
          {card.card_icon && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Icono:</span>
              <span className="text-sm text-muted-foreground">{card.card_icon}</span>
            </div>
          )}

          {card.card_type === "Monster" && (
            <>
              {card.monster_type && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tipo:</span>
                  <span className="text-sm text-muted-foreground">{card.monster_type}</span>
                </div>
              )}

              {/* Subtipo */}
              {card.subtype && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Subtipo:</span>
                  <span className="text-sm text-muted-foreground">{card.subtype}</span>
                </div>
              )}

              {/* Clasificación */}
              {card.classification && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Clasificación:</span>
                  <span className="text-sm text-muted-foreground">{card.classification}</span>
                </div>
              )}

              {card.attribute && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Atributo:</span>
                  <span className="text-sm text-muted-foreground">{card.attribute}</span>
                </div>
              )}

              {card.level_rank_link && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Nivel:</span>
                  <span className="text-sm text-muted-foreground">{card.level_rank_link}</span>
                </div>
              )}
              {card.atk !== null && card.def !== null && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ATK/DEF:</span>
                  <span className="text-sm text-muted-foreground">
                    {card.atk}/{card.def}
                  </span>
                </div>
              )}
            </>
          )}

          {card.set_name && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Set:</span>
              <span className="text-sm text-muted-foreground">{card.set_name}</span>
            </div>
          )}

          {card.set_code && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Código:</span>
              <span className="text-sm text-muted-foreground">{card.set_code}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-sm font-medium">Cantidad:</span>
            <span className="text-sm text-muted-foreground">{card.quantity}</span>
          </div>

          {card.condition && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Condición:</span>
              <span className="text-sm text-muted-foreground">{card.condition}</span>
            </div>
          )}

          {card.price && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Precio:</span>
              <span className="text-sm text-muted-foreground">${card.price}</span>
            </div>
          )}
        </div>

        {card.description && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Descripción:</h4>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{card.description}</p>
            </div>
          </>
        )}
      </CardContent>
    </UICard>
  )
}
