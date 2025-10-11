// app/cards/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { CardManagementInterface } from "@/components/card-management-interface";
import type { Card } from "@/types/card";

interface CardsPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  const currentPage = Number.parseInt(searchParams.page || '1', 10);
  const cardsPerPage = 48;
  const from = (currentPage - 1) * cardsPerPage;
  const to = from + cardsPerPage - 1;

  const { data: userCardsData, error: cardsError } = await supabase
    .from("user_cards")
    .select(`
      cantidad, 
      created_at,
      updated_at,
      Cartas(*)
    `)
    .eq('user_id', user.id)
    .range(from, to);

  const { count: totalCards } = await supabase
    .from("user_cards")
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  const totalPages = Math.ceil((totalCards || 0) / cardsPerPage);

  const userCards: Card[] = userCardsData?.map((userCard: any) => ({
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
    price: userCard.Cartas.price,
    card_icon: userCard.Cartas["Icono Carta"],
    subtype: userCard.Cartas.Subtipo, // <-- ¡LA CORRECCIÓN CLAVE!
    classification: userCard.Cartas.Clasificacion,
    created_at: userCard.created_at || new Date().toISOString(),
    updated_at: userCard.updated_at || new Date().toISOString(),
  })) || [];

  return (
    <div className="bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <CardManagementInterface initialCards={userCards} />
    </div>
  );
}