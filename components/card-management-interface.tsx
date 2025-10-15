"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import type { Card, CardFilters, SortBy, SortDirection } from "@/types/card"
import { DeckCardPreview } from "@/components/deck-card-preview"
import { CardGrid } from "@/components/card-grid"
import { CardSearchAndFilters } from "@/components/card-search-and-filters"
import { fetchMoreCards } from "@/app/cards/actions"
import { Loader2 } from "lucide-react"

// Helper para la ordenación por tipo (sin cambios)
const getCardSortValue = (card: Card): string => {
  const typeOrder: Record<string, number> = { Monster: 1, Spell: 2, Trap: 3 }
  const monsterSubtypeOrder: Record<string, number> = { Fusion: 1, Synchro: 2, Xyz: 3, Link: 4, Pendulum: 5, Ritual: 6, Effect: 7, Normal: 8, Tuner: 9, Flip: 10, Gemini: 11, Spirit: 12, Toon: 13, Union: 14 }
  const spellTrapOrder: Record<string, number> = { Normal: 1, Continuous: 2, Equip: 3, "Quick-Play": 4, Field: 5, Ritual: 6, Counter: 7 }
  const primary = typeOrder[card.card_type] ?? 99
  let secondary = 99
  if (card.card_type === "Monster") {
    if (card.subtype && monsterSubtypeOrder[card.subtype]) secondary = monsterSubtypeOrder[card.subtype]
    else if (card.classification && monsterSubtypeOrder[card.classification]) secondary = monsterSubtypeOrder[card.classification]
  } else if (card.card_icon && spellTrapOrder[card.card_icon]) {
    secondary = spellTrapOrder[card.card_icon]
  }
  return `${primary.toString().padStart(2, "0")}-${secondary.toString().padStart(2, "0")}`
}

// --- INICIO DE LA CORRECCIÓN ---
// Añadimos 'totalCards' a la definición de las props
interface CardManagementInterfaceProps {
  initialCards: Card[]
  totalCards: number
}

// Y la recibimos en la función del componente
export function CardManagementInterface({ initialCards, totalCards }: CardManagementInterfaceProps) {
// --- FIN DE LA CORRECCIÓN ---

  // --- Estados para el scroll infinito ---
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [page, setPage] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const hasMore = cards.length < totalCards

  // --- Otros estados (sin cambios) ---
  const [selectedCard, setSelectedCard] = useState<Card | null>(initialCards.length > 0 ? initialCards[0] : null)
  const [filters, setFilters] = useState<CardFilters>({ search: "", cardTypes: [], attributes: [], monsterTypes: [], levels: [], monsterClassifications: [], spellTrapIcons: [], subtypes: [], minAtk: "", minDef: "" })
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // --- Lógica de scroll infinito (sin cambios) ---
  const observer = useRef<IntersectionObserver>()
  const loaderRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCards()
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore])

  const loadMoreCards = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const newCards = await fetchMoreCards(page)
    setCards((prevCards) => [...prevCards, ...newCards])
    setPage((prevPage) => prevPage + 1)
    setIsLoading(false)
  }

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }
  
  // Resetea las cartas cuando cambian las props iniciales
  useEffect(() => {
    setCards(initialCards)
    setPage(2)
  }, [initialCards])

  // Lógica de filtrado y ordenación
  const processedCards = useMemo(() => {
    const filtered = cards.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesType = filters.cardTypes.length === 0 || filters.cardTypes.includes(card.card_type)
      const matchesAttribute = filters.attributes.length === 0 || (card.attribute && filters.attributes.includes(card.attribute))
      const matchesMonsterType = filters.monsterTypes.length === 0 || (card.monster_type && filters.monsterTypes.includes(card.monster_type))
      const matchesLevel = filters.levels.length === 0 || (card.level_rank_link !== null && card.level_rank_link !== undefined && filters.levels.includes(card.level_rank_link.toString()))
      const matchesMonsterClassification = filters.monsterClassifications.length === 0 || (card.classification && filters.monsterClassifications.includes(card.classification))
      const matchesSpellTrapIcon = filters.spellTrapIcons.length === 0 || (card.card_icon && filters.spellTrapIcons.some((filter) => card.card_icon?.toLowerCase().includes(filter.toLowerCase())))
      const matchesSubtype = filters.subtypes.length === 0 || filters.subtypes.some((filterSubtype) => { if (filterSubtype === "Normal" || filterSubtype === "Effect") { return card.classification === filterSubtype } return card.subtype === filterSubtype })
      const matchesMinAtk = !filters.minAtk || (card.atk !== null && card.atk !== undefined && card.atk >= Number.parseInt(filters.minAtk))
      const matchesMinDef = !filters.minDef || (card.def !== null && card.def !== undefined && card.def >= Number.parseInt(filters.minDef))
      return (matchesSearch && matchesType && matchesAttribute && matchesMonsterType && matchesLevel && matchesMonsterClassification && matchesSpellTrapIcon && matchesSubtype && matchesMinAtk && matchesMinDef)
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (sortBy === "card_type") {
        const valA = getCardSortValue(a);
        const valB = getCardSortValue(b);
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      let valA: number, valB: number
      if (sortBy === "atk") { valA = a.atk ?? -1; valB = b.atk ?? -1 } 
      else if (sortBy === "def") { valA = a.def ?? -1; valB = b.def ?? -1 } 
      else { valA = a.level_rank_link ?? -1; valB = b.level_rank_link ?? -1 }
      return sortDirection === "asc" ? valA - valB : valB - valA
    })
    return sorted
  }, [cards, filters, sortBy, sortDirection])

  return (
    <main className="container mx-auto px-6 py-8 h-[calc(100vh-64px)] flex flex-col gap-6">
      <div className="flex-shrink-0">
        <CardSearchAndFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      </div>
      <div className="flex-1 flex flex-row gap-8 overflow-hidden">
        <div className="w-full lg:w-96 flex-shrink-0">
          <DeckCardPreview card={selectedCard} />
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pr-2">
          <CardGrid cards={processedCards} selectedCard={selectedCard} onCardSelect={setSelectedCard} />
          {/* Elemento que se observará para cargar más cartas */}
          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {!hasMore && cards.length > 0 && <p className="text-muted-foreground">Has llegado al final.</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
