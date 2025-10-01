// components/deck-selection-modal.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Play, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

// Importa el servicio DESDE EL ARCHIVO DE CLIENTE que modificamos
import { DeckService } from "@/lib/deck-service.client";
import type { Deck, CreateDeckData } from "@/types/deck";

// 1. El componente recibe los datos como una prop: `initialDecks`
export function DeckSelectionModal({ initialDecks }: { initialDecks: Deck[] }) {
  // 2. El estado se inicializa con los datos recibidos
  const [decks, setDecks] = useState<Deck[]>(initialDecks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const router = useRouter();

  // 3. Ya NO hay `useEffect` ni `loadDecks` aquí.

  const createDeck = async () => {
    if (!newDeckName.trim()) return;
    try {
      const deckData: CreateDeckData = { name: newDeckName, description: newDeckDescription || undefined };
      // DeckService aquí usa el archivo seguro para el cliente
      const newDeck = await DeckService.createDeck(deckData);
      setDecks((prev) => [newDeck, ...prev]);
      setNewDeckName("");
      setNewDeckDescription("");
      setIsCreateModalOpen(false);
      router.push(`/decks/builder/${newDeck.id}`);
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  const openDeckBuilder = (deckId: string) => {
    router.push(`/decks/builder/${deckId}`);
  };

  const deleteDeck = async (deckId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este deck?")) return;
    try {
      // DeckService aquí usa el archivo seguro para el cliente
      await DeckService.deleteDeck(deckId);
      setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const getTotalCards = (deck: Deck) => {
    const main = deck.main_deck?.reduce((sum, card) => sum + card.quantity, 0) || 0;
    const extra = deck.extra_deck?.reduce((sum, card) => sum + card.quantity, 0) || 0;
    const side = deck.side_deck?.reduce((sum, card) => sum + card.quantity, 0) || 0;
    return main + extra + side;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance mb-2">Gestión de Decks</h1>
        <p className="text-muted-foreground text-pretty">Crea, edita y gestiona tus decks de Yu-Gi-Oh!</p>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">{decks.length} deck{decks.length !== 1 ? "s" : ""}</Badge>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Deck</DialogTitle>
              <DialogDescription>Ingresa los detalles para tu nuevo deck</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Nombre del Deck</Label>
                <Input id="deck-name" placeholder="Ej: Blue-Eyes Deck" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-description">Descripción (Opcional)</Label>
                <Input id="deck-description" placeholder="Describe tu estrategia..." value={newDeckDescription} onChange={(e) => setNewDeckDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                <Button onClick={createDeck} disabled={!newDeckName.trim()}>Crear Deck</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Card key={deck.id} className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{deck.name}</CardTitle>
                  <CardDescription className="mt-1">{deck.description || "Sin descripción"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(deck.updated_at).toLocaleDateString("es-ES")}
                  </span>
                  <span>{getTotalCards(deck)} cartas</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => openDeckBuilder(deck.id)}>
                    <Play className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                  <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => deleteDeck(deck.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {decks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tienes decks creados</p>
              <p className="text-sm">Crea tu primer deck para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}