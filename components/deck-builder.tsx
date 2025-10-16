"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardSearchAndFilters } from "@/components/card-search-and-filters"
import { DeckCardPreview } from "@/components/deck-card-preview"
import { DeckCardGrid } from "@/components/deck-card-grid"
import type { Card as CardType, CardFilters, SortBy, SortDirection } from "@/types/card"
import type { Deck } from "@/types/deck"
import { DeckService } from "@/lib/deck-service.client"
import { ArrowLeft, Save, Download, Trash2, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn, getCardGlowStyle } from "@/lib/utils"
import { FlippableCard } from "@/components/ui/flippable-card"

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

interface DraggedCardInfo {
  card: CardType
  source: "main" | "extra" | "side" | "list"
}

const getCardSortValue = (card: CardType): string => {
  const typeOrder: Record<string, number> = { Monster: 1, Spell: 2, Trap: 3 }
  const monsterSubtypeOrder: Record<string, number> = {
    Fusion: 1, Synchro: 2, Xyz: 3, Link: 4, Pendulum: 5, Ritual: 6, Effect: 7, Normal: 8,
    Tuner: 9, Flip: 10, Gemini: 11, Spirit: 12, Toon: 13, Union: 14,
  }
  const spellTrapOrder: Record<string, number> = {
    Normal: 1, Continuous: 2, Equip: 3, "Quick-Play": 4, Field: 5, Ritual: 6, Counter: 7,
  }
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

const DeckCardItem = ({ card, onMouseEnter, onClick, onRemove, onDragStart }: { card: DeckCard; onMouseEnter: () => void; onClick: () => void; onRemove: (e: React.MouseEvent) => void; onDragStart: (e: React.DragEvent) => void }) => (
    <div
      key={card.id}
      style={getCardGlowStyle(card)}
      className="relative group w-[6.66%] p-0.5"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
    >
      <div className="relative aspect-[2/3] w-full cursor-pointer group-hover:scale-150 group-hover:z-10 transition-transform duration-200 origin-bottom">
        <FlippableCard card={card} />
        {card.deckQuantity > 1 && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg z-10">
            {card.deckQuantity}
          </div>
        )}
      </div>
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-0 left-0 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
        onClick={onRemove}
      >
        <Minus className="h-3 w-3" />
      </Button>
    </div>
);

export function DeckBuilder({ deckId, initialCards, initialDeck }: DeckBuilderProps) {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [hoveredCard, setHoveredCard] = useState<CardType | null>(null)
  const [deck, setDeck] = useState<LocalDeck | null>(null)
  const [draggedCard, setDraggedCard] = useState<DraggedCardInfo | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState<CardFilters>({ search: "", cardTypes: [], attributes: [], monsterTypes: [], levels: [], monsterClassifications: [], spellTrapIcons: [], subtypes: [], minAtk: "", minDef: "" })
  const [dragCounter, setDragCounter] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }

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
        const card = initialCards.find((c) => c.id === deckCard.card_id)
        if (card) {
          result.push({ ...card, deckQuantity: deckCard.quantity })
        }
      }
      return result
    }
    const localDeck: LocalDeck = { id: deckData.id, name: deckData.name, description: deckData.description, mainDeck: await convertDeckCards(deckData.main_deck), extraDeck: await convertDeckCards(deckData.extra_deck), sideDeck: await convertDeckCards(deckData.side_deck) }
    setDeck(localDeck)
  }

  const processedCards = useMemo(() => {
    const filtered = initialCards.filter((card) => {
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
        const valA = getCardSortValue(a)
        const valB = getCardSortValue(b)
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      let valA: number, valB: number
      if (sortBy === "atk") {
        valA = a.atk ?? -1
        valB = b.atk ?? -1
      } else if (sortBy === "def") {
        valA = a.def ?? -1
        valB = b.def ?? -1
      } else { // level
        valA = a.level_rank_link ?? -1
        valB = b.level_rank_link ?? -1
      }
      return sortDirection === "asc" ? valA - valB : valB - valA
    })
    return sorted
  }, [initialCards, filters, sortBy, sortDirection])

  const addCardToDeck = (card: CardType, intendedDeck: "main" | "extra" | "side" = "main") => {
    if (!deck) return;

    let finalDeckType: "main" | "extra" | "side";
    const extraDeckTypes = ["fusion", "synchro", "xyz", "link"];
    const cardSubtypeLower = card.subtype?.toLowerCase();
    const isExtraDeckCard = card.card_type === "Monster" && cardSubtypeLower && extraDeckTypes.includes(cardSubtypeLower);

    if (isExtraDeckCard) {
      finalDeckType = intendedDeck === 'main' ? 'extra' : intendedDeck;
    } else {
      finalDeckType = intendedDeck === 'extra' ? 'main' : intendedDeck;
    }

    const totalCopiesInAllDecks = (deck.mainDeck.find(c => c.id === card.id)?.deckQuantity || 0) + (deck.extraDeck.find(c => c.id === card.id)?.deckQuantity || 0) + (deck.sideDeck.find(c => c.id === card.id)?.deckQuantity || 0);

    if (totalCopiesInAllDecks >= 3) {
      showMessage("No puedes tener más de 3 copias de la misma carta.", "error");
      return;
    }

    if (totalCopiesInAllDecks >= card.quantity) {
      showMessage(`No tienes más copias de ${card.name} en tu colección (${card.quantity} disponibles).`, "error");
      return;
    }

    const targetDeck = finalDeckType === 'main' ? deck.mainDeck : finalDeckType === 'extra' ? deck.extraDeck : deck.sideDeck;
    const existingCard = targetDeck.find((c) => c.id === card.id);

    if (existingCard) {
      existingCard.deckQuantity += 1;
    } else {
      const newDeckCard: DeckCard = { ...card, deckQuantity: 1 };
      targetDeck.push(newDeckCard);
    }
    
    setDeck({ ...deck });
  };

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

  const handleClearDeck = () => {
    if (!deck) return;
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres vaciar el Main, Extra y Side Deck? Esta acción no se puede deshacer."
    );
    if (confirmed) {
      setDeck({
        ...deck,
        mainDeck: [],
        extraDeck: [],
        sideDeck: [],
      });
      showMessage("Deck vaciado correctamente.", "success");
    }
  };

  const handleDragStart = (e: React.DragEvent, card: CardType, source: DraggedCardInfo["source"]) => {
    const dragImage = new Image();
    dragImage.src = card.image_url || "/card-back.png";
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.width = "86px";
    dragImage.style.height = "125px";
    dragImage.style.borderRadius = "4px";
    document.body.appendChild(dragImage);

    e.dataTransfer.setDragImage(dragImage, 43, 62.5);
    
    setDraggedCard({ card, source });

    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverTarget(null);
    setDragCounter(0);
  };

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

  const handleDropZone = (e: React.DragEvent, dropTarget: "main" | "extra" | "side") => {
    e.preventDefault();
    if (draggedCard) {
      const { card, source } = draggedCard;
      if (source === 'list') {
        addCardToDeck(card, dropTarget);
      } 
      else if (source !== dropTarget) {
        removeCardFromDeck(card.id, source);
        addCardToDeck(card, dropTarget);
      }
    }
    handleDragEnd();
  };

  const allowDrop = (e: React.DragEvent) => { e.preventDefault(); };

  const getTotalCards = () => { if (!deck) return { main: 0, extra: 0, side: 0 }; return { main: deck.mainDeck.reduce((sum, card) => sum + card.deckQuantity, 0), extra: deck.extraDeck.reduce((sum, card) => sum + card.deckQuantity, 0), side: deck.sideDeck.reduce((sum, card) => sum + card.deckQuantity, 0) } }
  
  const saveDeck = async () => { 
    if (!deck || isSaving) return; 
    setIsSaving(true); 
    try { 
      const convertToDbFormat = (deckCards: DeckCard[]) => { return deckCards.map((card) => ({ card_id: card.id, quantity: card.deckQuantity, })) }; 
      await DeckService.updateDeck(deck.id, { 
        name: deck.name, 
        description: deck.description, 
        main_deck: convertToDbFormat(deck.mainDeck), 
        extra_deck: convertToDbFormat(deck.extraDeck), 
        side_deck: convertToDbFormat(deck.sideDeck), 
      }); 
      showMessage("Deck guardado correctamente", "success") 
    } catch (error) { 
      showMessage("Error al guardar el deck", "error") 
    } finally { 
      setIsSaving(false) 
    } 
  }

  const sortDeck = (deckToSort: DeckCard[]) => {
    return [...deckToSort].sort((a, b) => {
      if (sortBy === "name") return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortBy === "card_type") { const valA = getCardSortValue(a); const valB = getCardSortValue(b); return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA); }
      let valA: number, valB: number;
      if (sortBy === "atk") { valA = a.atk ?? -1; valB = b.atk ?? -1; }
      else if (sortBy === "def") { valA = a.def ?? -1; valB = b.def ?? -1; }
      else { valA = a.level_rank_link ?? -1; valB = b.level_rank_link ?? -1; }
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }

  const sortedMainDeck = useMemo(() => deck ? sortDeck(deck.mainDeck) : [], [deck, sortBy, sortDirection]);
  const sortedExtraDeck = useMemo(() => deck ? sortDeck(deck.extraDeck) : [], [deck, sortBy, sortDirection]);
  const sortedSideDeck = useMemo(() => deck ? sortDeck(deck.sideDeck) : [], [deck, sortBy, sortDirection]);

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
    // Contenedor principal ahora es una columna flex que ocupa toda la pantalla y gestiona el scroll
    <div className="h-screen flex flex-col p-4 space-y-4">
      {/* Header - Se encogerá para no ocupar espacio innecesario */}
      <div className="flex items-center justify-between flex-shrink-0">
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
          <Button variant="destructive" onClick={handleClearDeck}>
            <Trash2 className="h-4 w-4 mr-2" />
            Vaciar Deck
          </Button>
        </div>
      </div>
      
      {/* Contenedor del contenido principal - Crecerá para ocupar el espacio restante y evitará desbordamiento */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Panel Izquierdo */}
        <div className="w-[22%]">
          <DeckCardPreview card={hoveredCard || selectedCard} />
        </div>

        {/* Panel Central y Derecho */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
        
          <div className="flex-shrink-0">
            <CardSearchAndFilters
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          </div>
          
          {/* Este contenedor alinea los dos paneles y les permite gestionar su propio scroll */}
          <div className="flex gap-4 w-full flex-1 min-h-0">
            
            {/* Contenedor de Mazos - Gestiona su propio scroll */}
            <div 
              className="w-[70%] flex flex-col bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 overflow-y-auto"
              onMouseLeave={() => setHoveredCard(null)}
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
                  {sortedMainDeck.map((card) => (
                    <DeckCardItem 
                      key={`main-${card.id}`} 
                      card={card} 
                      onMouseEnter={() => setHoveredCard(card)}
                      onClick={() => setSelectedCard(card)}
                      onRemove={(e) => { e.stopPropagation(); removeCardFromDeck(card.id, "main") }}
                      onDragStart={(e) => handleDragStart(e, card, "main")}
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 60 - cardCounts.main) }).map((_, index) => (
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
                  {sortedExtraDeck.map((card) => (
                    <DeckCardItem 
                      key={`extra-${card.id}`} 
                      card={card} 
                      onMouseEnter={() => setHoveredCard(card)}
                      onClick={() => setSelectedCard(card)}
                      onRemove={(e) => { e.stopPropagation(); removeCardFromDeck(card.id, "extra") }}
                      onDragStart={(e) => handleDragStart(e, card, "extra")}
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 15 - cardCounts.extra) }).map((_, index) => (
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
                  {sortedSideDeck.map((card) => (
                    <DeckCardItem 
                      key={`side-${card.id}`} 
                      card={card} 
                      onMouseEnter={() => setHoveredCard(card)}
                      onClick={() => setSelectedCard(card)}
                      onRemove={(e) => { e.stopPropagation(); removeCardFromDeck(card.id, "side") }}
                      onDragStart={(e) => handleDragStart(e, card, "side")}
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 15 - cardCounts.side) }).map((_, index) => (
                    <div key={`empty-side-${index}`} className="w-[6.66%] p-0.5">
                      <div className="aspect-[2/3] w-full border border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                        <div className="text-muted-foreground/40 text-xs">•</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Lista de Cartas Disponibles */}
            <div className="w-[30%] flex flex-col">
              <DeckCardGrid
                cards={processedCards}
                selectedCard={selectedCard}
                onCardSelect={setSelectedCard}
                onCardHover={setHoveredCard}
                onCardAdd={addCardToDeck}
                onDragStart={(e, card) => handleDragStart(e, card, 'list')}
                onDragEnd={handleDragEnd}
                deck={deck}
                isListView={true}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}