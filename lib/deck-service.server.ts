// lib/deck-service.server.ts

import 'server-only';
import { getSupabaseServer } from "./supabase-server";
import type { Deck } from "@/types/deck";

export async function getUserDecks(): Promise<Deck[]> {
  const supabase = getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // --- INICIO DE LA CORRECCIÓN ---
  // Volvemos a la consulta simple que sabemos que funciona con tus RLS
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id) // Mantenemos el filtro explícito por seguridad
    .order("updated_at", { ascending: false });
  // --- FIN DE LA CORRECCIÓN ---
    
  if (error) {
    // Si sigue fallando aquí, el error ya no será un objeto vacío y nos dará más pistas
    console.error("Error fetching decks:", error);
    throw error;
  }
  
  return data as Deck[];
}

export async function getDeckById(id: string): Promise<Deck | null> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase.from("decks").select("*").eq("id", id).single();
  
  if (error) {
    console.error("Error fetching deck:", error);
    return null;
  }

  return data;
}