export interface Deck {
  id: string
  name: string
  description?: string
  user_id: string
  main_deck: DeckCard[]
  extra_deck: DeckCard[]
  side_deck: DeckCard[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DeckCard {
  card_id: string
  quantity: number
}

export interface CreateDeckData {
  name: string
  description?: string
  main_deck?: DeckCard[]
  extra_deck?: DeckCard[]
  side_deck?: DeckCard[]
  is_public?: boolean
}
