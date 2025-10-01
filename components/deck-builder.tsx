"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardSearchAndFilters } from "@/components/card-search-and-filters"
import { DeckCardPreview } from "@/components/deck-card-preview"
import { DeckContainer } from "@/components/deck-container"
import { DeckCardGrid } from "@/components/deck-card-grid"
import type { Card as CardType, CardFilters } from "@/types/card"
import type { Deck } from "@/types/deck"
import { DeckService } from "@/lib/deck-service.client"
import { ArrowLeft, Save, Download, Share } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeckBuilderProps {
  deckId: string
  initialCards: CardType[]
  initialDeck: Deck // Add initialDeck prop to receive real deck data
}

interface DeckCard extends CardType {
  deckQuantity: number
}

interface LocalDeck {
  id: string
  name: string
  description?: string
  mainDeck: DeckCard[]
  extraDeck: DeckCard[]
  sideDeck: DeckCard[]
}

export function DeckBuilder({ deckId, initialCards, initialDeck }: DeckBuilderProps) {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [hoveredCard, setHoveredCard] = useState<CardType | null>(null)
  const [deck, setDeck] = useState<LocalDeck | null>(null)
  const [availableCards, setAvailableCards] = useState<CardType[]>(initialCards)
  const [draggedCard, setDraggedCard] = useState<CardType | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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
    loadDeckFromData(initialDeck)
    if (initialCards.length > 0) {
      setSelectedCard(initialCards[0])
    }
  }, [initialDeck, initialCards])

  const loadDeckFromData = async (deckData: Deck) => {
    const convertDeckCards = async (deckCards: { card_id: string; quantity: number }[]): Promise<DeckCard[]> => {
      const result: DeckCard[] = []

      for (const deckCard of deckCards) {
        const card = availableCards.find((c) => c.id === deckCard.card_id)
        if (card) {
          result.push({
            ...card,
            deckQuantity: deckCard.quantity,
          })
        }
      }

      return result
    }

    const localDeck: LocalDeck = {
      id: deckData.id,
      name: deckData.name,
      description: deckData.description,
      mainDeck: await convertDeckCards(deckData.main_deck),
      extraDeck: await convertDeckCards(deckData.extra_deck),
      sideDeck: await convertDeckCards(deckData.side_deck),
    }

    setDeck(localDeck)
  }

  const filteredCards = useMemo(() => {
    return availableCards.filter((card) => {
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
  }, [availableCards, filters])

  const addCardToDeck = (card: CardType, deckType: "main" | "extra" | "side" = "main") => {
    if (!deck) return

    // Determine appropriate deck based on card type if not specified
    let targetDeckType = deckType
    if (deckType === "main" && card.card_type === "Monster") {
      // Check if it's an Extra Deck monster (Fusion, Synchro, Xyz, Link)
      const extraDeckTypes = ["Fusion", "Synchro", "Xyz", "Link"]
      if (card.subtype && extraDeckTypes.includes(card.subtype)) {
        targetDeckType = "extra"
      }
    }

    const targetDeck =
      targetDeckType === "main" ? deck.mainDeck : targetDeckType === "extra" ? deck.extraDeck : deck.sideDeck
    const existingCard = targetDeck.find((c) => c.id === card.id)

    const totalCopiesInAllDecks =
      (deck.mainDeck.find((c) => c.id === card.id)?.deckQuantity || 0) +
      (deck.extraDeck.find((c) => c.id === card.id)?.deckQuantity || 0) +
      (deck.sideDeck.find((c) => c.id === card.id)?.deckQuantity || 0)

    if (totalCopiesInAllDecks >= 3) {
      console.log("[v0] Cannot add more copies: 3 copy limit reached for", card.name)
      showMessage("No puedes agregar más de 3 copias de la misma carta", "error")
      return
    }

    if (totalCopiesInAllDecks >= card.quantity) {
      console.log("[v0] Cannot add more copies: stock limit reached for", card.name, "- available:", card.quantity)
      showMessage(`No tienes más copias de ${card.name} en tu colección (${card.quantity} disponibles)`, "error")
      return
    }

    if (existingCard) {
      existingCard.deckQuantity += 1
    } else {
      const deckCard: DeckCard = { ...card, deckQuantity: 1 }
      targetDeck.push(deckCard)
    }

    console.log("[v0] Added card to deck:", card.name, "- total copies now:", totalCopiesInAllDecks + 1)
    setDeck({ ...deck })
  }

  const showMessage = (message: string, type: "success" | "error" = "success") => {
    const messageEl = document.createElement("div")
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-md z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`
    messageEl.textContent = message
    document.body.appendChild(messageEl)
    setTimeout(() => {
      if (document.body.contains(messageEl)) {
        document.body.removeChild(messageEl)
      }
    }, 3000)
  }

  const removeCardFromDeck = (cardId: string, deckType: "main" | "extra" | "side") => {
    if (!deck) return

    const targetDeck = deckType === "main" ? deck.mainDeck : deckType === "extra" ? deck.extraDeck : deck.sideDeck
    const cardIndex = targetDeck.findIndex((c) => c.id === cardId)

    if (cardIndex !== -1) {
      const card = targetDeck[cardIndex]
      if (card.deckQuantity > 1) {
        card.deckQuantity -= 1
      } else {
        targetDeck.splice(cardIndex, 1)
      }
    }

    setDeck({ ...deck })
  }

  const handleDragStart = (card: CardType) => {
    setDraggedCard(card)
  }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setDragOverTarget(null)
  }

  const handleDragOver = (e: React.DragEvent, target: string) => {
    e.preventDefault()
    setDragOverTarget(target)
  }

  const handleDragLeave = () => {
    setDragOverTarget(null)
  }

  const handleDrop = (e: React.DragEvent, deckType: "main" | "extra" | "side") => {
    e.preventDefault()
    if (draggedCard) {
      addCardToDeck(draggedCard, deckType)
    }
    setDraggedCard(null)
    setDragOverTarget(null)
  }

  const getTotalCards = () => {
    if (!deck) return { main: 0, extra: 0, side: 0 }

    return {
      main: deck.mainDeck.reduce((sum, card) => sum + card.deckQuantity, 0),
      extra: deck.extraDeck.reduce((sum, card) => sum + card.deckQuantity, 0),
      side: deck.sideDeck.reduce((sum, card) => sum + card.deckQuantity, 0),
    }
  }

  const saveDeck = async () => {
    if (!deck || isSaving) return

    setIsSaving(true)
    try {
      const convertToDbFormat = (deckCards: DeckCard[]) => {
        return deckCards.map((card) => ({
          card_id: card.id,
          quantity: card.deckQuantity,
        }))
      }

      await DeckService.updateDeck(deck.id, {
        name: deck.name,
        description: deck.description,
        main_deck: convertToDbFormat(deck.mainDeck),
        extra_deck: convertToDbFormat(deck.extraDeck),
        side_deck: convertToDbFormat(deck.sideDeck),
      })

      console.log("[v0] Deck saved successfully:", deck.name)
      showMessage("Deck guardado correctamente", "success")
    } catch (error) {
      console.error("[v0] Error saving deck:", error)
      showMessage("Error al guardar el deck", "error")
    } finally {
      setIsSaving(false)
    }
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando deck...</p>
        </div>
      </div>
    )
  }

  const cardCounts = getTotalCards()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/decks")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground text-sm">
              Main: {cardCounts.main}/60 • Extra: {cardCounts.extra}/15 • Side: {cardCounts.side}/15
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDeck} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <CardSearchAndFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex h-[calc(100vh-280px)] min-h-[600px] w-full">
        {/* Left Panel - Card Preview (25% width) */}
        <div className="w-1/4">
          <DeckCardPreview card={hoveredCard || selectedCard} />
        </div>

        {/* Center Panel - Deck Areas (50% width) */}
        <div className="w-1/2 flex flex-col">
          {/* Main Deck - Takes about 60% of center space */}
          <div className="flex-[3]">
            <DeckContainer
              title="Main Deck"
              cards={deck.mainDeck}
              maxCards={60}
              onCardClick={(card) => setSelectedCard(card)}
              onRemoveCard={(cardId) => removeCardFromDeck(cardId, "main")}
              onDragOver={(e) => handleDragOver(e, "main")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "main")}
              isDragOver={dragOverTarget === "main"}
              gridCols={10}
              isMainDeck={true}
            />
          </div>

          {/* Extra Deck - Takes about 25% of center space */}
          <div className="flex-[1.5]">
            <DeckContainer
              title="Extra Deck"
              cards={deck.extraDeck}
              maxCards={15}
              onCardClick={(card) => setSelectedCard(card)}
              onRemoveCard={(cardId) => removeCardFromDeck(cardId, "extra")}
              onDragOver={(e) => handleDragOver(e, "extra")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "extra")}
              isDragOver={dragOverTarget === "extra"}
              gridCols={10}
              isMainDeck={false}
            />
          </div>

          {/* Side Deck - Takes about 15% of center space */}
          <div className="flex-1">
            <DeckContainer
              title="Side Deck"
              cards={deck.sideDeck}
              maxCards={15}
              onCardClick={(card) => setSelectedCard(card)}
              onRemoveCard={(cardId) => removeCardFromDeck(cardId, "side")}
              onDragOver={(e) => handleDragOver(e, "side")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "side")}
              isDragOver={dragOverTarget === "side"}
              gridCols={10}
              isMainDeck={false}
            />
          </div>
        </div>

        {/* Right Panel - Available Cards List (25% width) */}
        <div className="w-1/4">
          <DeckCardGrid
            cards={filteredCards}
            selectedCard={selectedCard}
            onCardSelect={setSelectedCard}
            onCardAdd={addCardToDeck}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onCardHover={setHoveredCard}
            deck={deck}
            isListView={true}
          />
        </div>
      </div>
    </div>
  )
}
