"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardSearchAndFilters } from "@/components/card-search-and-filters"
import { DeckCardPreview } from "@/components/deck-card-preview"
import { DeckCardGrid } from "@/components/deck-card-grid"
import type { Card as CardType, CardFilters } from "@/types/card"
import type { Deck } from "@/types/deck"
import { DeckService } from "@/lib/deck-service.client"
import { ArrowLeft, Save, Download, Share, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DeckBuilderProps {
  deckId: string
  initialCards: CardType[]
  initialDeck: Deck
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
  const [filters, setFilters] = useState<CardFilters>({ search: "", cardTypes: [], attributes: [], monsterTypes: [], levels: [], monsterClassifications: [], spellTrapIcons: [], subtypes: [], minAtk: "", minDef: "" })
  
  // Nuevo estado para la lógica anti-parpadeo
  const [dragCounter, setDragCounter] = useState(0);

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
          result.push({ ...card, deckQuantity: deckCard.quantity })
        }
      }
      return result
    }
    const localDeck: LocalDeck = { id: deckData.id, name: deckData.name, description: deckData.description, mainDeck: await convertDeckCards(deckData.main_deck), extraDeck: await convertDeckCards(deckData.extra_deck), sideDeck: await convertDeckCards(deckData.side_deck) }
    setDeck(localDeck)
  }

  const filteredCards = useMemo(() => {
    return availableCards.filter((card) => {
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
  }, [availableCards, filters])

  const addCardToDeck = (card: CardType, deckType: "main" | "extra" | "side" = "main") => {
    if (!deck) return
    let targetDeckType = deckType
    if (deckType === "main" && card.card_type === "Monster") {
      const extraDeckTypes = ["Fusion", "Synchro", "Xyz", "Link"]
      if (card.subtype && extraDeckTypes.includes(card.subtype)) {
        targetDeckType = "extra"
      }
    }
    const targetDeck = targetDeckType === "main" ? deck.mainDeck : targetDeckType === "extra" ? deck.extraDeck : deck.sideDeck
    const existingCard = targetDeck.find((c) => c.id === card.id)
    const totalCopiesInAllDecks = (deck.mainDeck.find((c) => c.id === card.id)?.deckQuantity || 0) + (deck.extraDeck.find((c) => c.id === card.id)?.deckQuantity || 0) + (deck.sideDeck.find((c) => c.id === card.id)?.deckQuantity || 0)
    if (totalCopiesInAllDecks >= 3) { showMessage("No puedes agregar más de 3 copias de la misma carta", "error"); return }
    if (totalCopiesInAllDecks >= card.quantity) { showMessage(`No tienes más copias de ${card.name} en tu colección (${card.quantity} disponibles)`, "error"); return }
    if (existingCard) { existingCard.deckQuantity += 1 } else { const deckCard: DeckCard = { ...card, deckQuantity: 1 }; targetDeck.push(deckCard) }
    setDeck({ ...deck })
  }

  const showMessage = (message: string, type: "success" | "error" = "success") => {
    const messageEl = document.createElement("div")
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-md z-50 ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white`
    messageEl.textContent = message
    document.body.appendChild(messageEl)
    setTimeout(() => { if (document.body.contains(messageEl)) { document.body.removeChild(messageEl) } }, 3000)
  }

  const removeCardFromDeck = (cardId: string, deckType: "main" | "extra" | "side") => {
    if (!deck) return
    const targetDeck = deckType === "main" ? deck.mainDeck : deckType === "extra" ? deck.extraDeck : deck.sideDeck
    const cardIndex = targetDeck.findIndex((c) => c.id === cardId)
    if (cardIndex !== -1) {
      const card = targetDeck[cardIndex]
      if (card.deckQuantity > 1) { card.deckQuantity -= 1 } else { targetDeck.splice(cardIndex, 1) }
    }
    setDeck({ ...deck })
  }

  const handleDragStart = (card: CardType) => { setDraggedCard(card) }
  const handleDragEnd = () => { setDraggedCard(null); setDragOverTarget(null); setDragCounter(0); }

  const handleDragEnterZone = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    setDragOverTarget(target);
    setDragCounter(prev => prev + 1);
  };

  const handleDragLeaveZone = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => {
        const newCount = prev - 1;
        if (newCount <= 0) {
            setDragOverTarget(null);
        }
        return Math.max(0, newCount);
    });
  };

  const handleDropZone = (e: React.DragEvent, deckType: "main" | "extra" | "side") => {
    e.preventDefault();
    if (draggedCard) {
        const dropTargetDeck = dragOverTarget as "main" | "extra" | "side" | null;
        if (dropTargetDeck) {
            addCardToDeck(draggedCard, dropTargetDeck);
        }
    }
    setDraggedCard(null);
    setDragOverTarget(null);
    setDragCounter(0);
  };

  const allowDrop = (e: React.DragEvent) => { e.preventDefault(); };

  const getTotalCards = () => { if (!deck) return { main: 0, extra: 0, side: 0 }; return { main: deck.mainDeck.reduce((sum, card) => sum + card.deckQuantity, 0), extra: deck.extraDeck.reduce((sum, card) => sum + card.deckQuantity, 0), side: deck.sideDeck.reduce((sum, card) => sum + card.deckQuantity, 0) } }
  const saveDeck = async () => { if (!deck || isSaving) return; setIsSaving(true); try { const convertToDbFormat = (deckCards: DeckCard[]) => { return deckCards.map((card) => ({ card_id: card.id, quantity: card.deckQuantity, })) }; await DeckService.updateDeck(deck.id, { name: deck.name, description: deck.description, main_deck: convertToDbFormat(deck.mainDeck), extra_deck: convertToDbFormat(deck.extraDeck), side_deck: convertToDbFormat(deck.sideDeck), }); showMessage("Deck guardado correctamente", "success") } catch (error) { showMessage("Error al guardar el deck", "error") } finally { setIsSaving(false) } }

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

  const DeckCardItem = ({ card, deckType }: { card: DeckCard; deckType: "main" | "extra" | "side" }) => (
    <div 
      key={card.id} 
      className="relative group w-[6.66%] p-0.5" 
      onMouseEnter={() => setHoveredCard(card)}
      onClick={() => setSelectedCard(card)}
    >
      <div className="relative aspect-[2/3] w-full cursor-pointer group-hover:scale-150 group-hover:z-10 transition-transform duration-200 origin-bottom">
        <Image src={card.image_url || "/card-back.png"} alt={card.name} fill className="object-cover" sizes="5vw" />
        {card.deckQuantity > 1 && <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">{card.deckQuantity}</div>}
      </div>
      <Button size="sm" variant="destructive" className="absolute top-0 left-0 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20" onClick={(e) => { e.stopPropagation(); removeCardFromDeck(card.id, deckType)}}>
        <Minus className="h-3 w-3" />
      </Button>
    </div>
  );

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
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar</Button>
          <Button variant="outline"><Share className="h-4 w-4 mr-2" />Compartir</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <CardSearchAndFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex gap-4 h-[calc(100vh-230px)] min-h-[600px] w-full">
        {/* Left Panel */}
        <div className="w-[20%] flex flex-col overflow-hidden">
          <DeckCardPreview card={hoveredCard || selectedCard} />
        </div>

        {/* Center Panel */}
        <div 
          className="w-[55%] flex flex-col bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 overflow-y-auto"
          onMouseLeave={() => setHoveredCard(null)}
          // Los eventos de drag/drop se manejan a nivel de cada sección
        >
          {/* ---- Main Deck ---- */}
          <div 
            className={cn("mb-4 rounded p-2 transition-colors", dragOverTarget === 'main' && "bg-primary/10 ring-2 ring-primary")}
            onDragEnter={(e) => handleDragEnterZone(e, "main")}
            onDragLeave={handleDragLeaveZone}
            onDragOver={allowDrop}
            onDrop={(e) => handleDropZone(e, "main")}
          >
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <h3 className="text-lg font-semibold">Main Deck</h3>
              <Badge variant={cardCounts.main > 60 ? "destructive" : "secondary"} className="text-sm">{cardCounts.main}/60</Badge>
            </div>
            <div className="flex flex-wrap">
              {deck.mainDeck.map((card) => <DeckCardItem key={`main-${card.id}`} card={card} deckType="main" />)}
              {Array.from({ length: Math.max(0, 60 - deck.mainDeck.length) }).map((_, index) => (
                <div key={`empty-main-${index}`} className="w-[6.66%] p-0.5">
                  <div className="aspect-[2/3] w-full border border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-xs">•</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/50 my-2" />

          {/* ---- Extra Deck ---- */}
          <div 
            className={cn("mb-4 rounded p-2 transition-colors", dragOverTarget === 'extra' && "bg-primary/10 ring-2 ring-primary")}
            onDragEnter={(e) => handleDragEnterZone(e, "extra")}
            onDragLeave={handleDragLeaveZone}
            onDragOver={allowDrop}
            onDrop={(e) => handleDropZone(e, "extra")}
          >
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <h3 className="text-lg font-semibold">Extra Deck</h3>
              <Badge variant={cardCounts.extra > 15 ? "destructive" : "secondary"} className="text-sm">{cardCounts.extra}/15</Badge>
            </div>
            <div className="flex flex-wrap">
              {deck.extraDeck.map((card) => <DeckCardItem key={`extra-${card.id}`} card={card} deckType="extra" />)}
              {Array.from({ length: Math.max(0, 15 - deck.extraDeck.length) }).map((_, index) => (
                <div key={`empty-extra-${index}`} className="w-[6.66%] p-0.5">
                  <div className="aspect-[2/3] w-full border border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-xs">•</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/50 my-2" />
          
          {/* ---- Side Deck ---- */}
          <div 
            className={cn("rounded p-2 transition-colors", dragOverTarget === 'side' && "bg-primary/10 ring-2 ring-primary")}
            onDragEnter={(e) => handleDragEnterZone(e, "side")}
            onDragLeave={handleDragLeaveZone}
            onDragOver={allowDrop}
            onDrop={(e) => handleDropZone(e, "side")}
          >
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <h3 className="text-lg font-semibold">Side Deck</h3>
              <Badge variant={cardCounts.side > 15 ? "destructive" : "secondary"} className="text-sm">{cardCounts.side}/15</Badge>
            </div>
            <div className="flex flex-wrap">
              {deck.sideDeck.map((card) => <DeckCardItem key={`side-${card.id}`} card={card} deckType="side" />)}
              {Array.from({ length: Math.max(0, 15 - deck.sideDeck.length) }).map((_, index) => (
                <div key={`empty-side-${index}`} className="w-[6.66%] p-0.5">
                  <div className="aspect-[2/3] w-full border border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-xs">•</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="w-[25%] flex flex-col overflow-hidden">
          <DeckCardGrid
            cards={filteredCards}
            selectedCard={selectedCard}
            onCardSelect={setSelectedCard}
            onCardHover={setHoveredCard}
            onCardAdd={addCardToDeck}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            deck={deck}
            isListView={true}
          />
        </div>
      </div>
    </div>
  )
}