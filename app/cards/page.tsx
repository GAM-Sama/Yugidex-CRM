// app/cards/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { CardManagementInterface } from "@/components/card-management-interface";
import type { Card } from "@/types/card";

// Define cuántas cartas se cargarán cada vez
const CARDS_PER_PAGE = 48;

// La página ya no necesita los searchParams para la paginación
export default async function CardsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // 1. Obtenemos el número total de cartas que tiene el usuario
  const { count: totalCards } = await supabase
    .from("user_cards")
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  // 2. Obtenemos solo la primera página de cartas para la carga inicial
  const { data: userCardsData, error: cardsError } = await supabase
    .from("user_cards")
    .select(`
      cantidad, 
      created_at,
      updated_at,
      Cartas(*)
    `)
    .eq('user_id', user.id)
    .range(0, CARDS_PER_PAGE - 1); // Carga del 0 al 47

  // Depuración: Mostrar los datos de la primera carta para verificar los campos
  if (userCardsData && userCardsData.length > 0) {
    console.log('Datos completos de la primera carta:', JSON.stringify(userCardsData[0].Cartas, null, 2));
    console.log('Campos disponibles en Cartas:', Object.keys(userCardsData[0].Cartas).join(', '));
  }

  // Mapeo de datos con manejo de campos nulos
  const initialCards: Card[] = userCardsData?.map((userCard: any) => {
    // Depuración: Mostrar los datos en bruto de cada carta
    console.log('Datos en bruto de la carta:', {
      id: userCard.Cartas.ID_Carta || userCard.Cartas.id,
      nombre: userCard.Cartas.Nombre,
      tipo: userCard.Cartas.Tipo,
      subtipo: userCard.Cartas.Subtipo,
      escala_pendulo: userCard.Cartas.escala_pendulo,
      marco_carta: userCard.Cartas.Marco_Carta,
      rawData: userCard.Cartas
    });

    // Determinar si es una carta péndulo
    const isPendulum = 
      (userCard.Cartas.Tipo?.toLowerCase()?.includes('pendulum') || 
       userCard.Cartas.Subtipo?.toLowerCase()?.includes('pendulum')) &&
      userCard.Cartas.escala_pendulo != null;

    console.log(`La carta ${userCard.Cartas.Nombre} es Péndulo:`, isPendulum);

    return {
      id: userCard.Cartas.ID_Carta?.toString() || userCard.Cartas.id?.toString(),
      user_id: user.id,
      name: userCard.Cartas.Nombre || "Sin nombre",
      image_url: userCard.Cartas.Imagen,
      card_type: userCard.Cartas.Marco_Carta || "Monster",
      monster_type: userCard.Cartas.Tipo,
      attribute: userCard.Cartas.Atributo,
      level_rank_link: userCard.Cartas.Nivel_Rank_Link,
      atk: userCard.Cartas.ATK,
      def: userCard.Cartas.DEF,
      description: userCard.Cartas.Descripcion,
      rarity: userCard.Cartas.Rareza,
      set_code: userCard.Cartas.ID_Carta,
      set_name: userCard.Cartas.Set_Expansion,
      quantity: userCard.cantidad || 1,
      condition: userCard.condition,
      price: userCard.Cartas.price,
      card_icon: userCard.Cartas["Icono Carta"],
      subtype: userCard.Cartas.Subtipo,
      classification: userCard.Cartas.Clasificacion,
      pendulum_scale: userCard.Cartas.escala_pendulo,
      created_at: userCard.created_at || new Date().toISOString(),
      updated_at: userCard.updated_at || new Date().toISOString(),
    };
  }) || [];

  return (
    <div className="bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      {/* 3. Pasamos las cartas iniciales Y el total al componente cliente */}
      <CardManagementInterface initialCards={initialCards} totalCards={totalCards || 0} />
    </div>
  );
}