import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { CardManagementInterface } from "@/components/card-management-interface";
import type { Card } from "@/types/card";
import Link from 'next/link';

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

  const { data: cards, error: cardsError } = await supabase
    .from("Cartas")
    .select("*")
    .range(from, to);
    
  // La lógica para calcular totalPages ya no es necesaria para la vista,
  // pero la dejamos por si implementas scroll infinito en el futuro.
  const { count: totalCards } = await supabase
    .from("Cartas")
    .select('*', { count: 'exact', head: true });
  const totalPages = Math.ceil((totalCards || 0) / cardsPerPage);

  const userCards: Card[] = cards?.map((card: any) => ({
    id: card.ID_Carta?.toString() || card.id?.toString(),
    user_id: user.id,
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
    <div className="bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <CardManagementInterface initialCards={userCards} />
      {/* --- La barra de paginación ha sido eliminada de aquí --- */}
    </div>
  );
}