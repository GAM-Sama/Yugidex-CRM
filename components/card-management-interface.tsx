"use client"

import { useState, useMemo, useEffect, useRef, useCallback, useTransition } from "react"
import type { Card, CardFilters, SortBy, SortDirection } from "@/types/card"
import { DeckCardPreview } from "@/components/deck-card-preview"
import { CardGrid } from "@/components/card-grid"
import { CardSearchAndFilters } from "@/components/card-search-and-filters"
import { fetchMoreCards, deleteCard } from "@/app/cards/actions"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// ✅ Sistema de pesos dinámico basado en tipo
function getWeight(card: Card, sortBy: SortBy): number {
  const marcoLower = card.card_type?.toLowerCase() ?? ""
  const tipoLower = card.classification?.toLowerCase() ?? ""
  const subtypesLower = (card.subtype ? [card.subtype] : [])
    .map((s) => s.toLowerCase())

  const isLink =
    marcoLower.includes("link") ||
    tipoLower.includes("link") ||
    subtypesLower.includes("link")

  const isXyz =
    marcoLower.includes("xyz") ||
    tipoLower.includes("xyz") ||
    subtypesLower.includes("xyz")

  const isPendulum =
    marcoLower.includes("pendulum") ||
    tipoLower.includes("péndulo") ||
    subtypesLower.includes("pendulum")

  const isMonster =
    marcoLower.includes("monster") ||
    marcoLower.includes("monstruo") ||
    tipoLower.includes("monster")

  // 💡 Dinámica según campo de ordenación
  switch (sortBy) {
    case "link":
      if (isLink) return 0 // Prioriza Links
      break
    case "rank":
      if (isXyz) return 0 // Prioriza Xyz
      break
    case "pendulum":
      if (isPendulum) return 0 // Prioriza Péndulos
      break
    case "level":
      if (!isLink && !isXyz && !isPendulum && isMonster) return 0 // Monstruos normales arriba
      break
    default:
      break
  }

  // Orden general (por peso)
  if (isLink || isXyz || isPendulum) return 1 // Tipos especiales
  if (isMonster) return 2 // Monstruos normales
  return 3 // Magias/Trampas al final
}

interface CardManagementInterfaceProps {
  initialCards: Card[]
  totalCards: number
}

export function CardManagementInterface({ initialCards, totalCards }: CardManagementInterfaceProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [page, setPage] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const hasMore = cards.length < totalCards

  const [selectedCard, setSelectedCard] = useState<Card | null>(
    initialCards.length > 0 ? initialCards[0] : null
  )
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const [filters, setFilters] = useState<CardFilters>({
    search: "",
    cardTypes: [],
    attributes: [],
    monsterTypes: [],
    levels: [],
    monsterClassifications: [],
    spellTrapIcons: [],
    subtypes: [],
    minAtk: "",
    minDef: "",
  })
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // --- Selección y hover ---
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card)
    setPreviewCard(card)
  }

  const handleCardHover = (card: Card | null) => {
    if (card && selectedCard?.id !== card.id) setPreviewCard(card)
    else if (!card && selectedCard) setPreviewCard(selectedCard)
  }

  // --- Scroll infinito ---
  const observer = useRef<IntersectionObserver>()
  const loaderRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMoreCards()
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore]
  )

  const loadMoreCards = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const newCards = await fetchMoreCards(page)
    setCards((prev) => [...prev, ...newCards])
    setPage((prev) => prev + 1)
    setIsLoading(false)
  }

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }

  const handleDeleteCard = async (cardId: string, quantity: number) => {
    startTransition(async () => {
      try {
        const result = await deleteCard(cardId, quantity)
        if (!result.success) throw new Error(result.error || "Error al eliminar la carta")

        const deletedQuantity = result.quantity || 1
        const cardName = result.cardName || "la carta"

        toast.success(
          deletedQuantity > 1
            ? `Se han eliminado ${deletedQuantity} copias de ${cardName}`
            : `Se ha eliminado 1 copia de ${cardName}`
        )

        router.refresh()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al eliminar la carta"
        toast.error(errorMessage)
      }
    })
  }

  useEffect(() => {
    setCards(initialCards)
    setPage(2)
  }, [initialCards])

  // --- FILTRADO Y ORDENACIÓN AVANZADA ---
  const processedCards = useMemo(() => {
    const filtered = cards.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesType =
        filters.cardTypes.length === 0 || filters.cardTypes.includes(card.card_type)
      const matchesAttribute =
        filters.attributes.length === 0 ||
        (card.attribute && filters.attributes.includes(card.attribute))
      const matchesMonsterType =
        filters.monsterTypes.length === 0 ||
        (card.monster_type && filters.monsterTypes.includes(card.monster_type))
      
      // Filtros de ATK/DEF
      const cardAtk = card.atk ?? -1;
      const cardDef = card.def ?? -1;
      const matchesAtkRange = 
        (!filters.minAtk || cardAtk >= Number(filters.minAtk)) &&
        (!filters.maxAtk || cardAtk <= Number(filters.maxAtk));
      const matchesDefRange = 
        (!filters.minDef || cardDef >= Number(filters.minDef)) &&
        (!filters.maxDef || cardDef <= Number(filters.maxDef));
      
      // Determinar el tipo de monstruo para aplicar los filtros correctos
      const isPendulum = (card.monster_type?.toLowerCase().includes('pendulum') || 
                         card.subtype?.toLowerCase().includes('pendulum'));
      const isXyz = card.subtype?.toLowerCase().includes('xyz');
      const isLink = card.subtype?.toLowerCase().includes('link');
      const isNormalMonster = !isXyz && !isLink; // Monstruo normal (ni Xyz ni Link)
      
      // Obtener el valor numérico del nivel/rango/rating
      const cardLevel = card.level_rank_link ?? -1;
      const linkRating = card.link_rating ?? 0;
      
      // Verificar si hay algún filtro de nivel/rango activo
      const hasLevelFilter = filters.minLevel || filters.maxLevel;
      const hasRankFilter = filters.minRank || filters.maxRank;
      // Deshabilitado temporalmente el filtro de Link Rating
      const hasLinkRatingFilter = false; // Boolean(filters.minLinkRating || filters.maxLinkRating);
      
      // Mostrar todas las cartas por defecto
      let matchesLevelFilter = true;
      let matchesRankFilter = true;
      let matchesLinkRatingFilter = true;
      
      // Aplicar filtros solo si corresponden al tipo de carta
      
      // Aplicar filtros solo si corresponden al tipo de carta
      if (isNormalMonster) {
        // Solo aplicar filtro de nivel a monstruos normales
        matchesLevelFilter = 
          !hasLevelFilter || // Si no hay filtro de nivel, pasa
          (cardLevel >= Number(filters.minLevel || 1) && 
           cardLevel <= Number(filters.maxLevel || 12));
      }
      
      if (isXyz) {
        // Solo aplicar filtro de rango a monstruos Xyz
        matchesRankFilter = 
          !hasRankFilter || // Si no hay filtro de rango, pasa
          (cardLevel >= Number(filters.minRank || 1) && 
           cardLevel <= Number(filters.maxRank || 13));
      }
      
      if (isLink) {
        // Para monstruos Link, verificar el rating de enlace
        const linkRating = card.link_rating ?? 0;
        
        if (hasLinkRatingFilter) {
          // Si hay filtro de rating, la carta debe cumplir con el rango
          matchesLinkRatingFilter = 
            linkRating >= Number(filters.minLinkRating || 1) && 
            linkRating <= Number(filters.maxLinkRating || 8);
        } else {
          // Si no hay filtro de rating, la carta Link es válida
          matchesLinkRatingFilter = true;
        }
      }
      
      // La carta debe coincidir con los filtros de su tipo
      const matchesTypeSpecificFilters = 
        // Si es monstruo normal, debe coincidir con el filtro de nivel (si está activo)
        (!isNormalMonster || !hasLevelFilter || matchesLevelFilter) &&
        // Si es Xyz, debe coincidir con el filtro de rango (si está activo)
        (!isXyz || !hasRankFilter || matchesRankFilter) &&
        // Filtro de Link Rating temporalmente deshabilitado
        true;
      
      // Filtro de escala de péndulo (solo para cartas péndulo)
      const cardPendulumScale = card.pendulum_scale ?? 0;
      const matchesPendulumScale = 
        !isPendulum ? false : ( // Si no es péndulo, no coincide a menos que no se esté filtrando por escala
          (!filters.minPendulumScale || cardPendulumScale >= Number(filters.minPendulumScale)) &&
          (!filters.maxPendulumScale || cardPendulumScale <= Number(filters.maxPendulumScale))
        );
      
      // Si se está filtrando por escala de péndulo, solo mostrar cartas péndulo
      const shouldFilterByPendulumScale = filters.minPendulumScale || filters.maxPendulumScale;
      const matchesPendulumType = !shouldFilterByPendulumScale || isPendulum;
      
      // Filtros específicos por tipo de carta
      const matchesMonsterClassification =
        filters.monsterClassifications.length === 0 ||
        (card.classification && filters.monsterClassifications.includes(card.classification))
      const matchesSpellTrapIcon =
        filters.spellTrapIcons.length === 0 ||
        (card.card_icon &&
          filters.spellTrapIcons.some((f) =>
            card.card_icon?.toLowerCase().includes(f.toLowerCase())
          ))
      const matchesSubtype =
        filters.subtypes.length === 0 ||
        filters.subtypes.some((s) => {
          if (s === "Normal" || s === "Effect") return card.classification === s
          return card.subtype === s
        })

      return (
        matchesSearch &&
        matchesType &&
        matchesAttribute &&
        matchesMonsterType &&
        matchesTypeSpecificFilters && // Usar el filtro combinado de tipo
        matchesAtkRange &&
        matchesDefRange &&
        (!shouldFilterByPendulumScale || matchesPendulumScale) &&
        matchesPendulumType &&
        matchesMonsterClassification &&
        matchesSpellTrapIcon &&
        matchesSubtype
        // Asegurarse de que los monstruos que no coincidan con su filtro específico se oculten
        // (estas líneas ya no son necesarias porque la lógica está en matchesTypeSpecificFilters)
      )
    })

    const sorted = [...filtered].sort((a: Card, b: Card): number => {
      // Función para verificar si una carta es mágica o trampa
      const isSpellOrTrap = (card: Card): boolean =>
        card.card_type === "Spell" || card.card_type === "Trap"

      // Primero manejamos el caso de cartas mágicas/trampas
      const aIsSpellTrap = isSpellOrTrap(a)
      const bIsSpellTrap = isSpellOrTrap(b)

      // Si una es mágica/trampa y la otra no, la mágica/trampa siempre va al final
      if (aIsSpellTrap && !bIsSpellTrap) {
        return 1 // a (mágica/trampa) va después
      }
      if (!aIsSpellTrap && bIsSpellTrap) {
        return -1 // b (mágica/trampa) va después
      }

      // Si ambas son mágicas/trampas, las ordenamos entre ellas
      if (aIsSpellTrap && bIsSpellTrap) {
        // Primero por tipo (Spell antes que Trap)
        let comparison = a.card_type.localeCompare(b.card_type)
        // Luego por subtipo si son del mismo tipo
        if (comparison === 0) {
          comparison = (a.subtype || "").localeCompare(b.subtype || "")
        }
        // Finalmente por nombre
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name)
        }
        return sortDirection === "asc" ? comparison : -comparison
      }

      // Si llegamos aquí, ninguna es mágica/trampa
      // Verificamos si estamos ordenando por nivel, rango, link o pendulum
      const isSortingByLevel = sortBy === 'level';
      const isSortingByRank = sortBy === 'rank';
      const isSortingByLink = sortBy === 'link';
      const isSortingByPendulum = sortBy === 'pendulum';
      
      // Verificamos tipos de cartas
      const aIsLinkOrXyz = a.subtype === 'Link' || a.subtype === 'Xyz';
      const bIsLinkOrXyz = b.subtype === 'Link' || b.subtype === 'Xyz';
      const aIsXyz = a.subtype === 'Xyz';
      const bIsXyz = b.subtype === 'Xyz';
      const aIsLink = a.subtype === 'Link';
      const bIsLink = b.subtype === 'Link';
      // Mejoramos la detección de cartas Péndulo
      const aIsPendulum = (
        (a.monster_type?.toLowerCase().includes('pendulum') || 
         a.subtype?.toLowerCase().includes('pendulum')) && 
        a.pendulum_scale != null
      );
      const bIsPendulum = (
        (b.monster_type?.toLowerCase().includes('pendulum') || 
         b.subtype?.toLowerCase().includes('pendulum')) && 
        b.pendulum_scale != null
      );

      // Si estamos ordenando por nivel, las cartas Link y Xyz van al final (pero antes que magias/trampas)
      if (isSortingByLevel) {
        if (aIsLinkOrXyz && !bIsLinkOrXyz) {
          return 1; // a (Link/Xyz) va después
        }
        if (!aIsLinkOrXyz && bIsLinkOrXyz) {
          return -1; // b (Link/Xyz) va después
        }
        // Si ambas son Link/Xyz, las ordenamos entre ellas por nombre
        if (aIsLinkOrXyz && bIsLinkOrXyz) {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
      }
      
      // Si estamos ordenando por rango, solo aplica a cartas Xyz
      if (isSortingByRank) {
        if (aIsXyz && !bIsXyz) {
          return -1; // a (Xyz) va primero
        }
        if (!aIsXyz && bIsXyz) {
          return 1; // b (Xyz) va primero
        }
        // Si ninguna es Xyz, las ordenamos por nombre
        if (!aIsXyz && !bIsXyz) {
          return a.name.localeCompare(b.name);
        }
        // Si ambas son Xyz, la lógica de comparación se manejará en el switch
      }
      
      // Si estamos ordenando por link, solo aplica a cartas Link
      if (isSortingByLink) {
        if (aIsLink && !bIsLink) {
          return -1; // a (Link) va primero
        }
        if (!aIsLink && bIsLink) {
          return 1; // b (Link) va primero
        }
        // Si ninguna es Link, las ordenamos por nombre
        if (!aIsLink && !bIsLink) {
          return a.name.localeCompare(b.name);
        }
        // Si ambas son Link, la lógica de comparación se manejará en el switch
      }
      
      // Si estamos ordenando por péndulo
      if (isSortingByPendulum) {
        // Si una es Péndulo y la otra no, la Péndulo va primero
        if (aIsPendulum && !bIsPendulum) return -1;
        if (!aIsPendulum && bIsPendulum) return 1;
        
        // Si ninguna es Péndulo, ordenar por nombre
        if (!aIsPendulum && !bIsPendulum) {
          return a.name.localeCompare(b.name);
        }
        
        // Si ambas son Péndulo, ordenar por escala
        if (aIsPendulum && bIsPendulum) {
          // Aseguramos que los valores sean números válidos
          const scaleA = Number(a.pendulum_scale) || 0;
          const scaleB = Number(b.pendulum_scale) || 0;
          
          // Si las escalas son iguales, ordenar por nombre
          if (scaleA === scaleB) {
            return a.name.localeCompare(b.name);
          }
          
          // Ordenar por escala según la dirección
          return sortDirection === 'asc' ? scaleA - scaleB : scaleB - scaleA;
        }
      }

      // Si llegamos aquí, ninguna es mágica/trampa ni Link/Xyz (cuando se ordena por nivel)
      let comparison = 0

      // Función para parsear valores numéricos, manejando '?' y valores nulos/undefined
      const parseValue = (val: number | string | undefined | null): number => {
        if (val === "?" || val === undefined || val === null) return -1
        return typeof val === "string" ? parseInt(val) || -1 : val
      }

      // Función auxiliar para obtener el valor de nivel/rango/link
      const getLevelRankLinkValue = (card: Card): number => {
        return card.level_rank_link ?? -1
      }

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break

        case "atk":
          comparison = parseValue(a.atk) - parseValue(b.atk)
          break

        case "def":
          comparison = parseValue(a.def) - parseValue(b.def)
          break

        case "level":
          // Solo para monstruos que no son Xyz/Link (estos ya se manejaron antes)
          comparison = getLevelRankLinkValue(a) - getLevelRankLinkValue(b)
          break

        case "rank":
          // Solo para Xyz (ya verificamos que ambas son Xyz en la lógica anterior)
          comparison = getLevelRankLinkValue(a) - getLevelRankLinkValue(b);
          break

        case "link":
          // Solo para Link (ya verificamos que ambas son Link en la lógica anterior)
          comparison = (a.link_rating ?? -1) - (b.link_rating ?? -1);
          break

        case "pendulum":
          // Ya manejado en la lógica anterior
          comparison = 0;
          break

        case "card_type":
          // Ordenar por tipo principal (Monstruo, Mágica, Trampa)
          const typeOrder: Record<string, number> = {
            Monster: 1,
            Spell: 2,
            Trap: 3,
          }
          comparison = typeOrder[a.card_type] - typeOrder[b.card_type]

          // Si son del mismo tipo principal
          if (comparison === 0) {
            // Para monstruos, ordenar por subtipo
            if (a.card_type === "Monster") {
              const aType = a.subtype || ""
              const bType = b.subtype || ""
              comparison = aType.localeCompare(bType)

              // Si son del mismo subtipo, ordenar por nivel/rango
              if (comparison === 0) {
                comparison = getLevelRankLinkValue(a) - getLevelRankLinkValue(b)
              }
            }
            // Para mágicas/trampas, ordenar por subtipo
            else {
              comparison = (a.subtype || "").localeCompare(b.subtype || "")
            }
          }
          break

        default:
          comparison = 0
      }

      // Desempate por nombre si hay igualdad
      if (comparison === 0) {
        comparison = a.name.localeCompare(b.name)
      }

      // Aplicar dirección de ordenación
      return sortDirection === "asc" ? comparison : -comparison
    })

    return sorted
  }, [cards, filters, sortBy, sortDirection])

  return (
    <main className="container mx-auto px-6 py-8 h-[calc(100vh-64px)] flex flex-row gap-8">
      <div className="w-full lg:w-96 flex-shrink-0">
        <DeckCardPreview
          card={previewCard || selectedCard}
          onDelete={handleDeleteCard}
          isDeckEditor={false}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex-shrink-0">
          <CardSearchAndFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <CardGrid
            cards={processedCards}
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
            onCardHover={handleCardHover}
          />

          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {!hasMore && cards.length > 0 && (
              <p className="text-muted-foreground">Has llegado al final.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
