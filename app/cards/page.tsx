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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const currentPage = Number.parseInt(searchParams.page || '1', 10);
  const cardsPerPage = 48;
  const from = (currentPage - 1) * cardsPerPage;
  const to = from + cardsPerPage - 1;

  // --- CAMBIO 1: Consulta principal de datos ---
  // Ahora consultamos 'user_cards' y traemos los datos de 'Cartas' relacionados.
  const { data: userCardsData, error: cardsError } = await supabase
    .from("user_cards")
    .select(`
      cantidad, 
      Cartas(*)
    `)
    .eq('user_id', user.id) // El filtro clave
    .range(from, to);

  // --- CAMBIO 2: Cálculo del total para la paginación ---
  // Contamos solo las cartas en la colección del usuario.
  const { count: totalCards } = await supabase
    .from("user_cards")
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id); // El filtro clave también aquí
    
  const totalPages = Math.ceil((totalCards || 0) / cardsPerPage);

  // --- CAMBIO 3: Mapeo de datos a tu tipo `Card` ---
  // La estructura de los datos ha cambiado, así que ajustamos el mapeo.
  // Ahora, cada elemento `userCard` tiene `cantidad` y un objeto anidado `Cartas`.
  const userCards: Card[] = userCardsData?.map((userCard: any) => ({
    id: userCard.Cartas.ID_Carta?.toString() || userCard.Cartas.id?.toString(),
    user_id: user.id, // Ya lo tenemos del objeto user
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
    set_code: userCard.Cartas.set_code, // Asumiendo que esta columna existe en 'Cartas'
    quantity: userCard.cantidad || 1, // La cantidad viene directamente de 'user_cards'
    condition: userCard.condition, // Asumiendo que esta columna está en 'user_cards'
    price: userCard.Cartas.price, // Asumiendo que esta columna existe en 'Cartas'
    card_icon: userCard.Cartas["Icono Carta"],
    subtype: userCard.Cartas.Subtipo,
    classification: userCard.Cartas.Clasificacion,
    created_at: userCard.created_at || new Date().toISOString(), // De 'user_cards'
    updated_at: userCard.updated_at || new Date().toISOString(), // De 'user_cards'
  })) || [];

  return (
    <div className="bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      {/* Aquí podrías pasar totalPages si tu componente de interfaz lo necesita */}
      <CardManagementInterface initialCards={userCards} />
    </div>
  );
}