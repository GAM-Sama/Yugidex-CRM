// app/decks/builder/[id]/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { DeckBuilder } from "@/components/deck-builder";
import type { Card } from "@/types/card";
import { getDeckById } from "@/lib/deck-service.server"; 

interface DeckBuilderPageProps {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function DeckBuilderPage({ params, searchParams }: DeckBuilderPageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // --- CORRECCIÓN 1: Pasar 'supabase' a la función de servicio ---
  const deck = await getDeckById(supabase, params.id);
  if (!deck) {
    return redirect("/decks");
  }
  
  // --- CORRECCIÓN 4: Eliminar el 'await' innecesario ---
  const currentPage = Number.parseInt(searchParams.page || '1', 10);
  const cardsPerPage = 50;
  const from = (currentPage - 1) * cardsPerPage;
  const to = from + cardsPerPage - 1;

  // --- CORRECCIÓN 2: Cargar las cartas de la colección del usuario ---
  const { data: userCardsData, error: cardsError } = await supabase
    .from("user_cards")
    .select(`
      cantidad,
      Cartas(*)
    `)
    .eq('user_id', user.id)
    .range(from, to);

  // --- CORRECCIÓN 3: Contar solo las cartas del usuario ---
  const { count: totalCards } = await supabase
    .from("user_cards")
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const totalPages = Math.ceil((totalCards || 0) / cardsPerPage);
  
  // El mapeo se ajusta a la nueva estructura de datos (igual que en la página de cartas)
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
      quantity: userCard.cantidad || 1, // La cantidad viene de 'user_cards'
      condition: userCard.condition,
      price: userCard.Cartas.price,
      card_icon: userCard.Cartas["Icono Carta"],
      subtype: userCard.Cartas.Subtipo,
      classification: userCard.Cartas.Clasificacion,
      created_at: userCard.created_at || new Date().toISOString(),
      updated_at: userCard.updated_at || new Date().toISOString(),
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <main className="container mx-auto px-6 py-4">
        <DeckBuilder 
          deckId={params.id} 
          initialCards={availableCards} 
          initialDeck={deck} 
        />
      </main>
    </div>
  );
}