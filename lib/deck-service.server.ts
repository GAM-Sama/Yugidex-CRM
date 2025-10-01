// lib/deck-service.server.ts

import 'server-only';
import { getSupabaseServer } from "./supabase-server"; // Asumiendo que esta es tu función
import type { Deck } from "@/types/deck";

export async function getUserDecks(): Promise<Deck[]> {
  // 1. El cliente se crea aquí, DENTRO de la función
  const supabase = getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('decks')
    .select('*, main_deck:deck_cards(quantity), extra_deck:deck_cards(quantity), side_deck:deck_cards(quantity)')
    .eq('user_id', user.id)
    .order("updated_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching decks:", error);
    throw error;
  }
  
  return data as Deck[];
}

export async function getDeckById(id: string): Promise<Deck | null> {
  // 2. El cliente también se crea aquí, DENTRO de esta función
  const supabase = getSupabaseServer();

  const { data, error } = await supabase.from("decks").select("*").eq("id", id).single();
  
  if (error) {
    console.error("Error fetching deck:", error);
    // Devuelve null en lugar de lanzar un error para que la página pueda redirigir
    return null;
  }

  return data;
}