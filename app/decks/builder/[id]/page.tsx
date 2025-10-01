// app/decks/builder/[id]/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { DeckBuilder } from "@/components/deck-builder";
import type { Card } from "@/types/card";
import { getDeckById } from "@/lib/deck-service.server"; 
import Link from "next/link";

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

  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData?.user) {
    return redirect("/auth/login");
  }

  const deck = await getDeckById(params.id);
  if (!deck) {
    return redirect("/decks");
  }

  // --- INICIO DE LA OPTIMIZACIÓN ---

  const currentPage = Number.parseInt(searchParams.page || '1', 10);
  const cardsPerPage = 50; // Muestra 50 cartas por página
  const from = (currentPage - 1) * cardsPerPage;
  const to = from + cardsPerPage - 1;

  // 1. Obtenemos solo una "página" de cartas
  const { data: cardsData, error: cardsError } = await supabase
    .from("Cartas")
    .select("*")
    .range(from, to); // <-- La magia de la paginación

  // 2. (Opcional pero recomendado) Obtenemos el total de cartas para los botones
  const { count: totalCards } = await supabase
    .from("Cartas")
    .select('*', { count: 'exact', head: true });

  const totalPages = Math.ceil((totalCards || 0) / cardsPerPage);

  // --- FIN DE LA OPTIMIZACIÓN ---

  // Este es el bloque corregido y completo
  const availableCards: Card[] = cardsData?.map((card: any) => ({
    id: card.ID_Carta?.toString() || card.id?.toString(),
    user_id: authData.user.id, // Propiedad que faltaba
    name: card.Nombre || card.name || "",
    image_url: card.Imagen || card.image_url,
    card_type: card.Marco_Carta || card.card_type || "Monster",
    monster_type: card.siguiente || card.monster_type,
    attribute: card.Atributo || card.attribute,
    atk: card.ATK || card.atk,
    def: card.DEf || card.def,
    description: card.Descripcion || card.description,
    rarity: card.Rareza || card.rarity,
    set_name: card.Set_Expansion || card.set_name,
    set_code: card.set_code,
    quantity: card.Cantidad || card.quantity || 1,
    condition: card.condition,
    price: card.price,
    card_icon: card["Icono Carta"] || card.card_icon,
    subtype: card.Subtipo || card.subtype,
    classification: card.Clasificacion || card.classification,
    created_at: card.created_at || new Date().toISOString(), // Propiedad que faltaba
    updated_at: card.updated_at || new Date().toISOString(), // Propiedad que faltaba
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={authData.user} />
      <main className="container mx-auto px-6 py-4">
        {/* Pasamos los datos al DeckBuilder */}
        <DeckBuilder 
          deckId={params.id} 
          initialCards={availableCards} 
          initialDeck={deck} 
        />
      </main>
    </div>
  );
}