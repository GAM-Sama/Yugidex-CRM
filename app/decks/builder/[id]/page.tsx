// app/decks/builder/[id]/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { DeckBuilder } from "@/components/deck-builder";
import type { Card } from "@/types/card";

// 1. Importamos la función específica DESDE EL SERVICIO DE SERVIDOR
import { getDeckById } from "@/lib/deck-service.server"; 

interface DeckBuilderPageProps {
  params: {
    id: string
  }
}

export default async function DeckBuilderPage({ params }: DeckBuilderPageProps) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // 2. Usamos la función del servicio de servidor directamente
  const deck = await getDeckById(params.id);
  if (!deck) {
    redirect("/decks");
  }

  // El resto de tu código para obtener las cartas disponibles está bien
  const { data: cardsData } = await supabase.from("Cartas").select("*");
  const availableCards: Card[] = cardsData?.map((card: any) => ({
      id: card.ID_Carta?.toString() || card.id?.toString(),
      user_id: data.user!.id,
      name: card.Nombre || card.name || "",
      image_url: card.Imagen || card.image_url,
      card_type: card.Marco_Carta || card.card_type || "Monster",
      monster_type: card.Tipo || card.monster_type,
      attribute: card.Atributo || card.attribute,
      level_rank_link: card.Nivel_Rank_Link || card.level_rank_link,
      atk: card.ATK || card.atk,
      def: card.DEF || card.def,
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
      created_at: card.created_at || new Date().toISOString(),
      updated_at: card.updated_at || new Date().toISOString(),
  })) || [];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={data.user} />
      <main className="container mx-auto px-6 py-4">
        <DeckBuilder deckId={params.id} initialCards={availableCards} initialDeck={deck} />
      </main>
    </div>
  );
}