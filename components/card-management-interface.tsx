"use client"

import { useState, useMemo, useEffect } from "react"
import type { Card } from "@/types/card"
import { DeckCardPreview } from "@/components/deck-card-preview"
import { CardGrid } from "@/components/card-grid"
import { CardSearchAndFilters } from "@/components/card-search-and-filters"
import type { CardFilters } from "@/types/card"

interface CardManagementInterfaceProps {
  initialCards: Card[]
}

export function CardManagementInterface({ initialCards }: CardManagementInterfaceProps) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [selectedCard, setSelectedCard] = useState<Card | null>(initialCards.length > 0 ? initialCards[0] : null)
  const [filters, setFilters] = useState<CardFilters>({
    search: "",
    cardTypes: [],
    attributes: [],
    monsterTypes: [],
    levels: [],
    monsterClassifications: [],
    spellTrapIcons: [],
    subtypes: [],
    minAtk: "",
    minDef: "",
  })

  useEffect(() => {
    setCards(initialCards);
    if (initialCards.length > 0) {
        const selectedCardStillExists = initialCards.some(card => card.id === selectedCard?.id);
        if (!selectedCard || !selectedCardStillExists) {
            setSelectedCard(initialCards[0]);
        }
    } else {
        setSelectedCard(null);
    }
  }, [initialCards, selectedCard]);

  const filteredCards = useMemo(() => {
    // ... (Tu lógica de filtrado se queda exactamente igual)
    if (
      filters.search === "" &&
      filters.cardTypes.length === 0 &&
      filters.attributes.length === 0 &&
      filters.monsterTypes.length === 0 &&
      filters.levels.length === 0 &&
      filters.monsterClassifications.length === 0 &&
      filters.spellTrapIcons.length === 0 &&
      filters.subtypes.length === 0 &&
      filters.minAtk === "" &&
      filters.minDef === ""
    ) {
        return cards;
    }
    return cards.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesType = filters.cardTypes.length === 0 || filters.cardTypes.includes(card.card_type)
      const matchesAttribute =
        filters.attributes.length === 0 || (card.attribute && filters.attributes.includes(card.attribute))
      const matchesMonsterType =
        filters.monsterTypes.length === 0 || (card.monster_type && filters.monsterTypes.includes(card.monster_type))
      const matchesLevel =
        filters.levels.length === 0 ||
        (card.level_rank_link !== null &&
          card.level_rank_link !== undefined &&
          filters.levels.includes(card.level_rank_link.toString()))
      const matchesMonsterClassification =
        filters.monsterClassifications.length === 0 ||
        (card.classification && filters.monsterClassifications.includes(card.classification))
      const matchesSpellTrapIcon =
        filters.spellTrapIcons.length === 0 ||
        (card.card_icon &&
          filters.spellTrapIcons.some((filter) => card.card_icon?.toLowerCase().includes(filter.toLowerCase())))
      const matchesSubtype =
        filters.subtypes.length === 0 ||
        filters.subtypes.some((filterSubtype) => {
          if (filterSubtype === "Normal" || "Effect") {
            return card.classification === filterSubtype
          }
          return card.subtype === filterSubtype
        })
      const matchesMinAtk =
        !filters.minAtk || (card.atk !== null && card.atk !== undefined && card.atk >= Number.parseInt(filters.minAtk))
      const matchesMinDef =
        !filters.minDef || (card.def !== null && card.def !== undefined && card.def >= Number.parseInt(filters.minDef))

      return (
        matchesSearch &&
        matchesType &&
        matchesAttribute &&
        matchesMonsterType &&
        matchesLevel &&
        matchesMonsterClassification &&
        matchesSpellTrapIcon &&
        matchesSubtype &&
        matchesMinAtk &&
        matchesMinDef
      )
    })
  }, [cards, filters])

  return (
    // --- INICIO DE LA REESTRUCTURACIÓN COMPLETA CON FLEXBOX ---

    // 1. Contenedor principal que usa Flexbox en columna y ocupa el alto de la pantalla menos el Navbar (64px).
    // 'gap-6' añade el espacio vertical que querías.
    <main className="container mx-auto px-6 py-8 h-[calc(100vh-64px)] flex flex-col gap-6">
      
      {/* 2. Barra de Búsqueda (FIJA). 'flex-shrink-0' evita que se encoja. */}
      <div className="flex-shrink-0">
        <CardSearchAndFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* 3. Contenedor del contenido principal. Crece para ocupar el espacio restante ('flex-1') */}
      {/* y usa Flexbox en fila. 'overflow-hidden' es CRUCIAL para que el scroll funcione bien. */}
      <div className="flex-1 flex flex-row gap-8 overflow-hidden">
        
        {/* 4. Panel Izquierdo (FIJO). Ancho fijo y no se encoge. */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <DeckCardPreview card={selectedCard} />
        </div>

        {/* 5. Panel Derecho (SCROLLABLE). Crece para ocupar el espacio restante ('flex-1') */}
        {/* y es el ÚNICO elemento con scroll vertical. */}
        <div className="flex-1 overflow-y-auto pr-2">
          <CardGrid cards={filteredCards} selectedCard={selectedCard} onCardSelect={setSelectedCard} />
        </div>
      </div>
      
    </main>
    // --- FIN DE LA REESTRUCTURACIÓN ---
  )
}