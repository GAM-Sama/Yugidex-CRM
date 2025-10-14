// app/decks/builder/[id]/page.tsx

// --- CONFIGURACIÓN ---
// Marcamos la página como dinámica porque depende del usuario autenticado.
export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { DeckBuilder } from "@/components/deck-builder";
import type { Card } from "@/types/card";
import { getDeckById } from "@/lib/deck-service.server"; 

interface DeckBuilderPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DeckBuilderPage({ params }: DeckBuilderPageProps) {
  // ✅ Solución oficial: esperar a params antes de usarlo
  const { id } = await params;

  const supabase = await createClient();

  // Verificamos usuario autenticado
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Obtenemos el deck actual
  const deck = await getDeckById(supabase, id);
  if (!deck) {
    redirect("/decks");
  }

  // Obtenemos las cartas del usuario
  const { data: userCardsData, error: cardsError } = await supabase
    .from("user_cards")
    .select(`
      cantidad,
      created_at,
      updated_at,
      Cartas(*)
    `)
    .eq("user_id", user.id);

  if (cardsError) {
    console.error("Error al obtener las cartas del usuario:", cardsError);
  }

  // Transformamos los datos a tipo Card[]
  const availableCards: Card[] = userCardsData?.map((userCard: any) => ({
    id: userCard.Cartas.ID_Carta?.toString() || userCard.Cartas.id?.toString(),
    user_id: user.id,
    name: userCard.Cartas.Nombre || "",
    image_url: userCard.Cartas.Imagen,
    card_type: userCard.Cartas.Marco_Carta || "Monster",
    monster_type: userCard.Cartas.Tipo,
    attribute: userCard.Cartas.Atributo,
    level_rank_link: userCard.Cartas.Nivel_Rank_Link,
    atk: userCard.Cartas.ATK,
    def: userCard.Cartas.DEF,
    description: userCard.Cartas.Descripcion,
    rarity: userCard.Cartas.Rareza,
    set_name: userCard.Cartas.Set_Expansion,
    set_code: userCard.Cartas.set_code,
    quantity: userCard.cantidad || 1,
    condition: userCard.condition,
    price: userCard.price,
    card_icon: userCard.Cartas["Icono Carta"],
    subtype: userCard.Cartas.Subtipo,
    classification: userCard.Cartas.Clasificacion,
    created_at: userCard.created_at || new Date().toISOString(),
    updated_at: userCard.updated_at || new Date().toISOString(),
  })) || [];

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <main className="container mx-auto px-6 py-4">
        <DeckBuilder 
          deckId={id}
          initialCards={availableCards}
          initialDeck={deck}
        />
      </main>
    </div>
  );
}
