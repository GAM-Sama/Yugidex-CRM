// types/card.ts
export interface Card {
  id: string
  user_id: string
  name: string
  image_url?: string
  card_type: "Monster" | "Spell" | "Trap"
  monster_type?: string
  attribute?: "LIGHT" | "DARK" | "WATER" | "FIRE" | "EARTH" | "WIND" | "DIVINE"
  level_rank_link?: number
  link_rating?: number // 🔹 Nivel de Enlace (Link Rating)
  pendulum_scale?: number // 🔹 Escala Péndulo
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
  // Filtros numéricos
  minAtk?: string
  maxAtk?: string
  minDef?: string
  maxDef?: string
  minLevel?: string
  maxLevel?: string
  minRank?: string
  maxRank?: string
  minLinkRating?: string
  maxLinkRating?: string
  minPendulumScale?: string
  maxPendulumScale?: string
}

// --- NUEVA VERSIÓN ---
export type SortBy =
  | "name"
  | "card_type"
  | "atk"
  | "def"
  | "level"
  | "rank" // 🔹 Rango (para Xyz)
  | "link" // 🔹 Ratio Enlace
  | "pendulum" // 🔹 Escala Péndulo

export type SortDirection = "asc" | "desc"
