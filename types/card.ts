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
  cardTypes: string[] // Changed from cardType to cardTypes array
  attributes: string[] // Changed from attribute to attributes array
  monsterTypes: string[] // Changed from monsterType to monsterTypes array
  levels: string[]
  monsterClassifications: string[] // Para Normal, Effect, etc. - usa campo classification
  spellTrapIcons: string[] // Para tipos de mágicas/trampas - usa campo card_icon
  subtypes: string[] // Para subtipos de monstruos - usa campo subtype y classification
  minAtk?: string
  minDef?: string
}
