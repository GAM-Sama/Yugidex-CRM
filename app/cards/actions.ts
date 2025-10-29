// app/cards/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { Card } from '@/types/card'
import { revalidatePath } from 'next/cache'

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

// Define the response type for deleteCard
type DeleteCardResponse = {
  success: boolean;
  error?: string;
  quantity?: number;
  cardName?: string;
};

// Delete a card from user's collection
export async function deleteCard(cardId: string, quantity: number = 1): Promise<DeleteCardResponse> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No estás autenticado' }
  }

  try {
    console.log('Buscando carta con ID:', cardId, 'para el usuario:', user.id)
    
    // Primero, obtenemos el registro de la carta del usuario usando card_code
    const { data: cardData, error: fetchError } = await supabase
      .from('user_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('card_code', cardId) // Usamos card_code en lugar de carta_id
      .maybeSingle()

    console.log('Resultado de la consulta:', { cardData, fetchError })

    if (fetchError) {
      console.error('Error al buscar la carta:', fetchError)
      return { success: false, error: 'Error al buscar la carta en tu colección' }
    }
    
    if (!cardData) {
      return { 
        success: false, 
        error: 'Carta no encontrada en tu colección. ID: ' + cardId 
      }
    }

    const currentQuantity = Number(cardData.cantidad) || 1
    const cardName = cardData.card_code ? `la carta ${cardData.card_code}` : 'la carta'
    
    console.log('Carta encontrada:', { currentQuantity, cardName, cardData })
    
    // Calculate new quantity after deletion
    const newQuantity = currentQuantity - quantity

    if (newQuantity > 0) {
      // Update the quantity if there are remaining cards
      const { error: updateError } = await supabase
        .from('user_cards')
        .update({ 
          cantidad: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardData.id)

      if (updateError) {
        console.error('Error updating card quantity:', updateError)
        throw new Error('Error al actualizar la cantidad de la carta')
      }
    } else {
      // If no cards remain, delete the record
      const { error: deleteError } = await supabase
        .from('user_cards')
        .delete()
        .eq('id', cardData.id)

      if (deleteError) {
        console.error('Error deleting card:', deleteError)
        throw new Error('Error al eliminar la carta de tu colección')
      }
    }

    // Revalidate the cards page to show the updated list
    revalidatePath('/cards')
    return { 
      success: true, 
      quantity: Math.min(quantity, currentQuantity),
      cardName
    }
  } catch (error) {
    console.error('Error deleting card:', error)
    return { success: false, error: 'Error al eliminar la carta' }
  }
}