// lib/deck-service.client.ts

import { getSupabaseClient } from "./supabase-client"; // Solo importa el cliente de navegador
import type { Deck, CreateDeckData } from "@/types/deck";

// Nota: No hay ninguna referencia a getSupabaseServer aquí

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

// Exportamos las funciones que el modal usará
export const DeckService = {
  createDeck,
  deleteDeck,
};