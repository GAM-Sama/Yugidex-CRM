import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { CardManagementInterface } from "@/components/card-management-interface"

export default async function CardsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // ===== CONSULTA DIRECTA DESDE TABLA Cartas =====
  let userCards: any[] = []

  try {
    const { data: cards, error: cardsError } = await supabase.from("Cartas").select("*")
    // .limit(20)

    if (cardsError) {
      console.log("[v0] Error en consulta:", cardsError.message)
      userCards = []
    } else {
      // Mapear los campos de la base de datos a la interfaz Card
      userCards =
        cards?.map((card: any) => ({
          id: card.ID_Carta?.toString() || card.id?.toString(),
          user_id: data.user.id,
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
          set_code: card.set_code, // Este campo puede no existir en la BD
          quantity: card.Cantidad || card.quantity || 1,
          condition: card.condition, // Este campo puede no existir en la BD
          price: card.price, // Este campo puede no existir en la BD
          card_icon: card["Icono Carta"] || card.card_icon,
          subtype: card.Subtipo || card.subtype,
          classification: card.Clasificacion || card.classification,
          created_at: card.created_at || new Date().toISOString(),
          updated_at: card.updated_at || new Date().toISOString(),
        })) || []

      console.log("[v0] Cartas mapeadas:", userCards.length)
      console.log("[v0] Primera carta mapeada:", userCards[0])
    }
  } catch (error) {
    console.log("[v0] Exception en consulta:", error)
    userCards = []
  }

  console.log("[v0] Cartas cargadas:", userCards.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={data.user} />
      <CardManagementInterface initialCards={userCards} />
    </div>
  )
}
