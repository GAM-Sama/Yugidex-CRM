"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import type { Card as CardType } from "@/types/card"
import type { Deck } from "@/types/deck"
import { DeckService } from "@/lib/deck-service.client"
import { cn } from "@/lib/utils"
import { Save, RotateCcw, Trash2, Plus } from "lucide-react"

interface AdvancedDeckBuilderProps {
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

export function AdvancedDeckBuilder({ deckId, initialCards, initialDeck }: AdvancedDeckBuilderProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [deck, setDeck] = useState<LocalDeck | null>(null)
  const [availableCards, setAvailableCards] = useState<CardType[]>(initialCards)
  const [isSaving, setIsSaving] = useState(false)
  const [deckName, setDeckName] = useState("")

  // Filters for the right panel
  const [filters, setFilters] = useState({
    attribute: "All",
    type: "All",
    level: "All",
    search: "",
  })

  useEffect(() => {
    loadDeckFromData(initialDeck)
    setDeckName(initialDeck.name)
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
      const matchesSearch = !filters.search || card.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesAttribute = !filters.attribute || card.attribute === filters.attribute
      const matchesType = !filters.type || card.card_type === filters.type
      const matchesLevel = !filters.level || card.level_rank_link?.toString() === filters.level

      return matchesSearch && matchesAttribute && matchesType && matchesLevel
    })
  }, [availableCards, filters])

  const addCardToDeck = (card: CardType, deckType: "main" | "extra" | "side" = "main") => {
    if (!deck) return

    // Auto-determine deck type for monsters
    let targetDeckType = deckType
    if (deckType === "main" && card.card_type === "Monster") {
      const extraDeckTypes = ["Fusion", "Synchro", "Xyz", "Link"]
      if (card.subtype && extraDeckTypes.includes(card.subtype)) {
        targetDeckType = "extra"
      }
    }

    const targetDeck =
      targetDeckType === "main" ? deck.mainDeck : targetDeckType === "extra" ? deck.extraDeck : deck.sideDeck
    const existingCard = targetDeck.find((c) => c.id === card.id)

    // Check 3-copy limit
    const totalCopiesInAllDecks =
      (deck.mainDeck.find((c) => c.id === card.id)?.deckQuantity || 0) +
      (deck.extraDeck.find((c) => c.id === card.id)?.deckQuantity || 0) +
      (deck.sideDeck.find((c) => c.id === card.id)?.deckQuantity || 0)

    if (totalCopiesInAllDecks >= 3) return
    if (totalCopiesInAllDecks >= card.quantity) return

    if (existingCard) {
      existingCard.deckQuantity += 1
    } else {
      const deckCard: DeckCard = { ...card, deckQuantity: 1 }
      targetDeck.push(deckCard)
    }

    setDeck({ ...deck })
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
        name: deckName,
        description: deck.description,
        main_deck: convertToDbFormat(deck.mainDeck),
        extra_deck: convertToDbFormat(deck.extraDeck),
        side_deck: convertToDbFormat(deck.sideDeck),
      })

      console.log("[v0] Deck saved successfully")
    } catch (error) {
      console.error("[v0] Error saving deck:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getTotalCards = () => {
    if (!deck) return { main: 0, extra: 0, side: 0 }
    return {
      main: deck.mainDeck.reduce((sum, card) => sum + card.deckQuantity, 0),
      extra: deck.extraDeck.reduce((sum, card) => sum + card.deckQuantity, 0),
      side: deck.sideDeck.reduce((sum, card) => sum + card.deckQuantity, 0),
    }
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

  const getTypeBreakdown = () => {
    if (!deck) return { monster: 0, spell: 0, trap: 0 }

    const breakdown = { monster: 0, spell: 0, trap: 0 }

    deck.mainDeck.forEach((card) => {
      const quantity = card.deckQuantity
      if (card.card_type === "Monster") {
        breakdown.monster += quantity
      } else if (card.card_type === "Spell") {
        breakdown.spell += quantity
      } else if (card.card_type === "Trap") {
        breakdown.trap += quantity
      }
    })

    return breakdown
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
  const typeBreakdown = getTypeBreakdown()

  return (
    <div className="h-screen w-full flex bg-background">
      {/* Left Column - Inspector Panel (30%) */}
      <div className="w-[30%] border-r border-border bg-card/50 flex flex-col">
        {/* Selected Card Image */}
        <div className="p-4 border-b border-border">
          {selectedCard ? (
            <div className="space-y-3">
              <div className="relative aspect-[2/3] w-full max-w-[280px] mx-auto overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <Image
                  src={selectedCard.image_url || "/card-back.png?height=600&width=400&query=Yu-Gi-Oh card back"}
                  alt={selectedCard.name}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-balance">{selectedCard.name}</h3>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge className={getTypeColor(selectedCard.card_type)} size="sm">
                    {selectedCard.card_type}
                  </Badge>
                  {selectedCard.rarity && (
                    <Badge variant="outline" size="sm">
                      {selectedCard.rarity}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[2/3] w-full max-w-[280px] mx-auto bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">Selecciona una carta</p>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        <div className="flex-1 p-4">
          <Tabs defaultValue="info" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Card Info</TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 h-full">
              <ScrollArea className="h-full">
                {selectedCard ? (
                  <div className="space-y-4">
                    {selectedCard.card_type === "Monster" && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedCard.monster_type && (
                          <div>
                            <span className="font-medium text-muted-foreground">Tipo:</span>
                            <div className="text-foreground">{selectedCard.monster_type}</div>
                          </div>
                        )}
                        {selectedCard.attribute && (
                          <div>
                            <span className="font-medium text-muted-foreground">Atributo:</span>
                            <div className="text-foreground">{selectedCard.attribute}</div>
                          </div>
                        )}
                        {selectedCard.level_rank_link && (
                          <div>
                            <span className="font-medium text-muted-foreground">Nivel:</span>
                            <div className="text-foreground">{selectedCard.level_rank_link}</div>
                          </div>
                        )}
                        {selectedCard.atk !== null && selectedCard.def !== null && (
                          <div>
                            <span className="font-medium text-muted-foreground">ATK/DEF:</span>
                            <div className="text-foreground font-bold">
                              {selectedCard.atk}/{selectedCard.def}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedCard.card_icon && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Tipo: </span>
                        <span className="text-foreground">{selectedCard.card_icon}</span>
                      </div>
                    )}

                    {selectedCard.description && (
                      <div className="border-t border-border/50 pt-3">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Efecto:</h4>
                        <p className="text-sm text-foreground text-pretty leading-relaxed bg-muted/30 p-3 rounded">
                          {selectedCard.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Selecciona una carta para ver sus detalles</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="log" className="mt-4">
              <div className="text-muted-foreground text-sm">
                <p>Historial de cambios del deck...</p>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <div className="text-muted-foreground text-sm">
                <p>Chat de construcción de deck...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Main Workspace (70%) */}
      <div className="w-[70%] flex flex-col">
        {/* Control Header */}
        <div className="border-b border-border bg-card/30 p-4">
          <div className="space-y-4">
            {/* Top Row - Deck Name and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                  placeholder="Nombre del deck"
                />
                <div className="text-sm text-muted-foreground">
                  Main: {cardCounts.main}/60 • Extra: {cardCounts.extra}/15 • Side: {cardCounts.side}/15
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveDeck} disabled={isSaving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Guardando..." : "Save"}
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sort
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Bottom Row - Filters */}
            <div className="flex items-center gap-4">
              <Select value={filters.attribute} onValueChange={(value) => setFilters({ ...filters, attribute: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Attribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="LIGHT">LIGHT</SelectItem>
                  <SelectItem value="DARK">DARK</SelectItem>
                  <SelectItem value="WATER">WATER</SelectItem>
                  <SelectItem value="FIRE">FIRE</SelectItem>
                  <SelectItem value="EARTH">EARTH</SelectItem>
                  <SelectItem value="WIND">WIND</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Monster">Monster</SelectItem>
                  <SelectItem value="Spell">Spell</SelectItem>
                  <SelectItem value="Trap">Trap</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Level {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search cards..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Card Grids Area */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* Main Deck */}
          <Card>
            <CardHeader className="pb-2 py-2">
              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 text-white px-3 py-1 rounded text-sm">
                <span>Deck: {cardCounts.main}</span>
                <span>
                  Monster {typeBreakdown.monster} Spell {typeBreakdown.spell} Trap {typeBreakdown.trap}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-12 gap-1 min-h-[180px]">
                {deck.mainDeck.map((card) => (
                  <div key={card.id} className="relative group">
                    <div
                      className="relative aspect-[2/3] cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-primary/10 to-accent/10 rounded overflow-hidden"
                      onClick={() => setSelectedCard(card)}
                    >
                      <Image
                        src={card.image_url || "/card-back.png?height=300&width=200&query=Yu-Gi-Oh card back"}
                        alt={card.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 8vw, 4vw"
                      />
                      {card.deckQuantity > 1 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full font-bold">
                          {card.deckQuantity}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -left-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      onClick={() => removeCardFromDeck(card.id, "main")}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Extra Deck */}
          <Card>
            <CardHeader className="pb-2 py-2">
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-purple-700 text-white px-3 py-1 rounded text-sm">
                <span>Extra: {cardCounts.extra}</span>
                <span>Fusion 14 Xyz 0 Synchro 0 Link 1 Ritual 0</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex gap-0 min-h-[100px] overflow-hidden">
                {deck.extraDeck.map((card, index) => (
                  <div
                    key={card.id}
                    className="relative group flex-shrink-0"
                    style={{
                      marginLeft: index > 0 ? "-20px" : "0",
                      zIndex: deck.extraDeck.length - index,
                    }}
                  >
                    <div
                      className="relative w-16 aspect-[2/3] cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-primary/10 to-accent/10 rounded overflow-hidden"
                      onClick={() => setSelectedCard(card)}
                    >
                      <Image
                        src={card.image_url || "/card-back.png?height=300&width=200&query=Yu-Gi-Oh card back"}
                        alt={card.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      {card.deckQuantity > 1 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full font-bold">
                          {card.deckQuantity}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -left-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      onClick={() => removeCardFromDeck(card.id, "extra")}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Deck */}
          <Card>
            <CardHeader className="pb-2 py-2">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-800 to-blue-700 text-white px-3 py-1 rounded text-sm">
                <span>Side: {cardCounts.side}</span>
                <span>Monster 1 Spell 2 Trap 0</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex gap-0 min-h-[100px] overflow-hidden">
                {deck.sideDeck.map((card, index) => (
                  <div
                    key={card.id}
                    className="relative group flex-shrink-0"
                    style={{
                      marginLeft: index > 0 ? "-20px" : "0",
                      zIndex: deck.sideDeck.length - index,
                    }}
                  >
                    <div
                      className="relative w-16 aspect-[2/3] cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-primary/10 to-accent/10 rounded overflow-hidden"
                      onClick={() => setSelectedCard(card)}
                    >
                      <Image
                        src={card.image_url || "/card-back.png?height=300&width=200&query=Yu-Gi-Oh card back"}
                        alt={card.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      {card.deckQuantity > 1 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full font-bold">
                          {card.deckQuantity}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -left-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      onClick={() => removeCardFromDeck(card.id, "side")}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Cards List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Available Cards ({filteredCards.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredCards.map((card) => (
                    <div
                      key={card.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                        selectedCard?.id === card.id && "bg-primary/10 ring-1 ring-primary",
                      )}
                      onClick={() => setSelectedCard(card)}
                    >
                      {/* Card Image */}
                      <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded bg-gradient-to-br from-primary/10 to-accent/10">
                        <Image
                          src={card.image_url || "/card-back.png?height=300&width=200&query=Yu-Gi-Oh card back"}
                          alt={card.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>

                      {/* Card Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{card.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(card.card_type)} size="sm">
                            {card.card_type}
                          </Badge>
                          {card.rarity && <span className="text-xs text-muted-foreground">{card.rarity}</span>}
                        </div>
                        {card.card_type === "Monster" && card.atk !== null && card.def !== null && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ATK: {card.atk} / DEF: {card.def}
                            {card.level_rank_link && ` • Lv.${card.level_rank_link}`}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">Disponibles: {card.quantity}</div>
                      </div>

                      {/* Add Button */}
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          addCardToDeck(card)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
