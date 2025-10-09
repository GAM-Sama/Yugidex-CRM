// lib/deck-service.server.ts

import 'server-only';
// CAMBIO 1: Importa el tipo SupabaseClient para un tipado fuerte.
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Deck } from "@/types/deck";

// CAMBIO 2: La función ahora acepta 'supabase' como primer argumento.
export async function getUserDecks(supabase: SupabaseClient): Promise<Deck[]> {
  // CAMBIO 3: Eliminamos esta línea. Ya no se crea el cliente aquí.
  // const supabase = getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('decks') // Asegúrate que tu tabla se llame 'decks' y no 'Mazos'
    .select('*')
    .eq('user_id', user.id)
    .order("updated_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching decks:", error);
    throw error;
  }
  
  return data as Deck[];
}

// CAMBIO 4: Hacemos lo mismo para getDeckById.
export async function getDeckById(supabase: SupabaseClient, id: string): Promise<Deck | null> {
  // Eliminamos esta línea también.
  // const supabase = getSupabaseServer();

  const { data, error } = await supabase.from("decks").select("*").eq("id", id).single();
  
  if (error) {
    console.error("Error fetching deck:", error);
    return null;
  }

  return data;
}