export interface Card {
  id: string
  user_id: string
  name: string
  image_url?: string
  card_type: "Monster" | "Spell" | "Trap"
  monster_type?: string
  attribute?: "LIGHT" | "DARK" | "WATER" | "FIRE" | "EARTH" | "WIND" | "DIVINE"
  level_rank_link?: number
  atk?: number
  def?: number
  description?: string
  rarity?: string
  set_name?: string
  set_code?: string
  quantity: number
  condition?: string
  price?: number
  card_icon?: string // Icono Carta
  subtype?: string // Subtipo
  classification?: string // Clasificación
  created_at: string
  updated_at: string
}

export interface CardFilters {
  search: string
  cardTypes: string[]
  attributes: string[]
  monsterTypes: string[]
  levels: string[]
  monsterClassifications: string[]
  spellTrapIcons: string[]
  subtypes: string[]
  minAtk?: string
  minDef?: string
}

// --- INICIO DE LA MODIFICACIÓN ---
// Criterio por el que se ordena
export type SortBy = "name" | "atk" | "def" | "level" | "card_type"

// Dirección de la ordenación
export type SortDirection = "asc" | "desc"
// --- FIN DE LA MODIFICACIÓN ---