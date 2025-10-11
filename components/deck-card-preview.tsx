// components/deck-card-preview.tsx
"use client"

import type { Card } from "@/types/card"
import { Badge } from "@/components/ui/badge"
import React, { useState, useEffect } from "react";
import { FlippableCard } from "@/components/ui/flippable-card";

interface DeckCardPreviewProps {
  card: Card | null
}

const parseDescription = (description: string) => {
    return description.split(/<br\s*\/?>/i).map((line, index, arr) => (
        <React.Fragment key={index}>
            {line}
            {index < arr.length - 1 && <br />}
        </React.Fragment>
    ));
};

export function DeckCardPreview({ card }: DeckCardPreviewProps) {
  // Estado para controlar el volteo manual de la carta
  const [isManuallyFlipped, setIsManuallyFlipped] = useState(true);

  // Cada vez que la carta seleccionada cambia, la mostramos por delante
  useEffect(() => {
    setIsManuallyFlipped(true);
  }, [card]);

  if (!card) {
    return (
      <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg h-full flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center text-sm">Pasa el ratón sobre una carta para ver sus detalles</p>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Monster":
      case "Fusion Monster":
      case "Synchro Monster":
      case "XYZ Monster":
      case "Link Monster":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
      case "Spell":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
      case "Trap":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
  }

  const getLevelLabel = () => {
    if (card.subtype?.includes('Xyz')) return 'Rango:';
    if (card.subtype?.includes('Link')) return 'Link:';
    return 'Nivel:';
  }

  return (
    <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 h-full flex flex-col">
      <div className="mb-2 flex-shrink-0">
        <h2 className="text-md font-bold text-balance leading-tight mb-2">{card.name}</h2>
        <div className="flex flex-wrap gap-1">
          <Badge className={getTypeColor(card.card_type)}>{card.card_type}</Badge>
          {card.rarity && <Badge variant="outline">{card.rarity}</Badge>}
          {card.classification && <Badge variant="secondary">{card.classification}</Badge>}
          {card.subtype && <Badge variant="secondary">{card.subtype}</Badge>}
        </div>
      </div>

      {/* --- INICIO DE LA MODIFICACIÓN --- */}
      <div 
        className="relative aspect-[59/86] w-full max-w-[200px] mx-auto mb-3 flex-shrink-0 cursor-pointer"
        onClick={() => setIsManuallyFlipped(prev => !prev)} // <-- Añadimos el handler de clic aquí
      >
        <FlippableCard
          src={card.image_url || "/card-back.png"}
          alt={card.name}
          isFlipped={isManuallyFlipped} // <-- Le pasamos el estado para que obedezca
        />
      </div>
      {/* --- FIN DE LA MODIFICACIÓN --- */}

      <div className="space-y-3 flex-1 overflow-y-auto text-xs pr-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {card.monster_type && (
                <div>
                    <span className="font-medium text-muted-foreground block">Tipo:</span>
                    <div className="text-foreground">{card.monster_type}</div>
                </div>
            )}
            {card.attribute && (
                <div>
                    <span className="font-medium text-muted-foreground block">Atributo:</span>
                    <div className="text-foreground">{card.attribute}</div>
                </div>
            )}
            {card.level_rank_link != null && (
                <div>
                    <span className="font-medium text-muted-foreground block">{getLevelLabel()}</span>
                    <div className="text-foreground">{card.level_rank_link}</div>
                </div>
            )}
            {card.atk != null && (
                <div>
                    <span className="font-medium text-muted-foreground block">ATK/DEF:</span>
                    <div className="text-foreground font-bold">{card.atk} / {card.def ?? '?'}</div>
                </div>
            )}
        </div>

        {card.card_icon && (
            <div>
                <span className="font-medium text-muted-foreground">Icono: </span>
                <span className="text-foreground">{card.card_icon}</span>
            </div>
        )}

        {card.description && (
          <div className="border-t border-border/50 pt-2">
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Efecto:</h4>
            <p className="text-xs text-foreground/90 text-pretty leading-relaxed bg-muted/30 p-2 rounded">
              {parseDescription(card.description)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}