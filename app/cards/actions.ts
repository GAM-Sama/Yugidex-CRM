// app/cards/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { Card } from '@/types/card'

// Esta función se ejecutará en el servidor de forma segura
export async function fetchMoreCards(page: number) {
  const cardsPerPage = 48;
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return [] // Si no hay usuario, no devuelve nada
  }

  // Calcula el rango de cartas a pedir basado en el número de página
  const from = (page - 1) * cardsPerPage
  const to = from + cardsPerPage - 1

  const { data: userCardsData, error } = await supabase
    .from('user_cards')
    .select('cantidad, created_at, updated_at, Cartas(*)')
    .eq('user_id', user.id)
    .range(from, to)

  if (error) {
    console.error('Error fetching more cards:', error)
    return []
  }

  // Mapea los datos de la misma forma que en la página principal
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
    subtype: userCard.Cartas.Subtipo,
    classification: userCard.Cartas.Clasificacion,
    created_at: userCard.created_at || new Date().toISOString(),
    updated_at: userCard.updated_at || new Date().toISOString(),
  })) || []

  return userCards
}