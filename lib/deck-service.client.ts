// lib/deck-service.client.ts

import { getSupabaseClient } from "./supabase-client";
import type { Deck, CreateDeckData } from "@/types/deck";

const supabase = getSupabaseClient();

async function createDeck(deckData: CreateDeckData): Promise<Deck> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("decks")
    .insert({ ...deckData, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteDeck(id: string): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) throw error;
}

// --- INICIO DE LA CORRECCIÓN ---

// 1. Añadimos la función que faltaba
async function updateDeck(id: string, updates: Partial<CreateDeckData>): Promise<Deck> {
  const { data, error } = await supabase
    .from("decks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating deck:", error);
    throw error;
  }
  return data;
}

// 2. Exportamos la nueva función junto con las otras
export const DeckService = {
  createDeck,
  deleteDeck,
  updateDeck, // <-- Aquí está la clave
};

// --- FIN DE LA CORRECCIÓN ---