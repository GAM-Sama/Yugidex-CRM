// lib/getCardSortValue.ts
import type { Card } from "@/types/card"

export function getCardSortValue(card: Card): string {
  // --- PRIMER NIVEL: Tipo General ---
  let mainType = "99"
  switch (card.card_type) {
    case "Monster": mainType = "01"; break
    case "Spell": mainType = "02"; break
    case "Trap": mainType = "03"; break
  }

  // --- SEGUNDO NIVEL: Subtipo o Icono ---
  let subType = "99"

  if (card.card_type === "Monster") {
    const subtypePriority: Record<string, string> = {
      Fusion: "01",
      Synchro: "02",
      Xyz: "03",
      Link: "04",
      Pendulum: "05",
      Ritual: "06",
      Effect: "07",
      Normal: "08",
      Tuner: "09",
      Flip: "10",
      Gemini: "11",
      Spirit: "12",
      Toon: "13",
      Union: "14",
      Token: "15",
    }

    const found = card.subtype
      ? subtypePriority[card.subtype]
      : card.classification
      ? subtypePriority[card.classification]
      : undefined

    subType = found ?? "99"
  } else if (card.card_type === "Spell" || card.card_type === "Trap") {
    const iconPriority: Record<string, string> = {
      Normal: "01",
      Continuous: "02",
      "Quick-Play": "03",
      Equip: "04",
      Field: "05",
      Ritual: "06",
      Counter: "07",
    }

    subType = iconPriority[card.card_icon ?? ""] ?? "99"
  }

  return `${mainType}-${subType}`
}
