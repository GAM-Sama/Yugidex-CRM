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
          if (filterSubtype === "Normal" || filterSubtype === "Effect") {
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
    <main className="container mx-auto px-6 py-8">
      {/* --- INICIO DE LA CORRECCIÓN --- */}
      
      {/* 1. El título y el subtítulo ahora están fuera del div 'sticky' */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-balance mb-2">Gestión de Cartas</h1>
        <p className="text-muted-foreground text-pretty">Explora y gestiona tu colección de cartas Yu-Gi-Oh!</p>
      </div>

      {/* 2. El div 'sticky' ahora solo contiene la barra de búsqueda y filtros */}
      <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-20 pt-4 pb-4 mb-6">
        <CardSearchAndFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* 3. El contenedor de las columnas principales tiene un margen superior para compensar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* El 'top' del panel izquierdo se ajusta a la nueva altura del header 'sticky' */}
        <div className="w-full lg:w-1/3 flex-shrink-0 sticky top-32 z-10">
          <DeckCardPreview card={selectedCard} />
        </div>

        <div className="w-full lg:w-2/3">
          <CardGrid cards={filteredCards} selectedCard={selectedCard} onCardSelect={setSelectedCard} />
        </div>
      </div>
      
      {/* --- FIN DE LA CORRECCIÓN --- */}
    </main>
  )
}
