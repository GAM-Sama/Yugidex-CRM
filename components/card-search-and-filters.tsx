"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CardFilters, SortBy, SortDirection } from "@/types/card"
import { Search, Filter, X, Star, Square, Circle, Zap, ArrowUp, ArrowDown } from "lucide-react"

// --- INICIO DE LA MODIFICACIÓN ---
interface CardSearchAndFiltersProps {
  filters: CardFilters
  onFiltersChange: (filters: CardFilters) => void
  sortBy: SortBy
  sortDirection: SortDirection
  onSortChange: (sortBy: SortBy) => void
}

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "name", label: "Nombre" },
  { value: "card_type", label: "Tipo de Carta" },
  { value: "atk", label: "Ataque" },
  { value: "def", label: "Defensa" },
  { value: "level", label: "Nivel/Rango" },
]

export function CardSearchAndFilters({
  filters,
  onFiltersChange,
  sortBy,
  sortDirection,
  onSortChange,
}: CardSearchAndFiltersProps) {
  // --- FIN DE LA MODIFICACIÓN ---
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ... (el resto de tus constantes como cardTypes, monsterTypes, etc. no cambian)
  const cardTypes = ["Monster", "Spell", "Trap"]
  const monsterTypes = [ "Aqua", "Beast", "Beast-Warrior", "Winged Beast", "Divine-Beast", "Cyberse", "Fiend", "Dinosaur", "Dragon", "Sea Serpent", "Fish", "Warrior", "Fairy", "Illusion", "Insect", "Spellcaster", "Machine", "Reptile", "Rock", "Thunder", "Wyrm", "Zombie", "Pyro", "Psychic", "Creator God", ]
  const attributes = ["LIGHT", "DARK", "WATER", "FIRE", "EARTH", "WIND", "DIVINE"]
  const spellTrapIcons = ["Normal", "Field", "Equip", "Continuous", "Quick-Play", "Ritual", "Counter"]
  const subtypes = [ "Normal", "Effect", "Fusion", "Ritual", "Synchro", "Xyz", "Pendulum", "Link", "Tuner", "Flip", "Gemini", "Spirit", "Toon", "Union", "Token", ]

  const toggleArrayFilter = (key: keyof CardFilters, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]

    onFiltersChange({ ...filters, [key]: newArray })
  }

  const updateFilter = (key: keyof CardFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
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
  }

  const getActiveFiltersCount = () => {
    const arrayFilters = [
      filters.cardTypes,
      filters.attributes,
      filters.monsterTypes,
      filters.levels,
      filters.monsterClassifications,
      filters.spellTrapIcons,
      filters.subtypes,
    ]
    const arrayCount = arrayFilters.reduce((count, arr) => count + arr.length, 0)
    const otherFilters = [filters.minAtk, filters.minDef].filter((value) => value && value !== "").length
    return arrayCount + otherFilters
  }

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Nombre"

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          {/* --- AÑADIDO text-primary PARA CAMBIAR EL COLOR DE LA LUPA --- */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4 z-10" />
          <Input
            placeholder="Buscar cartas por nombre..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 rounded-xl h-12 bg-card/80 backdrop-blur-sm border-0 shadow-lg"
          />
        </div>

        {/* --- INICIO DE LA MODIFICACIÓN: Botón de Ordenar --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl h-12 px-4 md:px-6 bg-card/80 backdrop-blur-sm border-0 shadow-lg flex-shrink-0"
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4 mr-2 text-primary" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-2 text-primary" />
              )}
              <span className="hidden md:inline">Ordenar por:</span>
              <strong className="ml-1">{currentSortLabel}</strong>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => onSortChange(option.value)}>
                {option.label}
                {sortBy === option.value &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-auto h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-auto h-4 w-4" />
                  ))}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 bg-card/80 backdrop-blur-sm border-0 shadow-lg relative"
            >
              <Filter className="h-4 w-4 mr-2 text-primary" />
              <span className="hidden md:inline">Filtros</span>
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-700">
            {/* ... (El contenido del diálogo de filtros no cambia) ... */}
            <DialogHeader className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-xl text-white">Menú de filtros</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Selecciona múltiples opciones para refinar tu búsqueda
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="space-y-8 py-6">
              {/* Marco de carta */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Square className="h-5 w-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Marco de carta</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cardTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filters.cardTypes.includes(type) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter("cardTypes", type)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        filters.cardTypes.includes(type)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      }`}
                    >
                      {type === "Monster" ? "Monstruo" : type === "Spell" ? "Mágica" : "Trampa"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Atributo */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Circle className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Atributo</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {attributes.map((attribute) => (
                    <Button
                      key={attribute}
                      variant={filters.attributes.includes(attribute) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter("attributes", attribute)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        filters.attributes.includes(attribute)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      }`}
                    >
                      {attribute}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Tipos de Mágicas y Trampas</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {spellTrapIcons.map((icon) => (
                    <Button
                      key={icon}
                      variant={filters.spellTrapIcons.includes(icon) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter("spellTrapIcons", icon)}
                      className={`h-12 rounded-lg border-2 transition-all text-sm ${
                        filters.spellTrapIcons.includes(icon)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      }`}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Tipo de Monstruo</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {monsterTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filters.monsterTypes.includes(type) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter("monsterTypes", type)}
                      className={`h-12 rounded-lg border-2 transition-all text-xs px-2 ${
                        filters.monsterTypes.includes(type)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      }`}
                    >
                      <span className="truncate">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Square className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Subtipos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {subtypes.map((subtype) => (
                    <Button
                      key={subtype}
                      variant={filters.subtypes.includes(subtype) ? "default" : "outline"}
                      onClick={() => toggleArrayFilter("subtypes", subtype)}
                      className={`h-12 rounded-lg border-2 transition-all text-sm ${
                        filters.subtypes.includes(subtype)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      }`}
                    >
                      {subtype}
                    </Button>
                  ))}
                </div>
              </div>

              {/* ATK/DEF Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">ATK Mínimo</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAtk || ""}
                    onChange={(e) => updateFilter("minAtk", e.target.value)}
                    className="h-12 rounded-lg bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">DEF Mínimo</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minDef || ""}
                    onChange={(e) => updateFilter("minDef", e.target.value)}
                    className="h-12 rounded-lg bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="rounded-xl bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
              <Button onClick={() => setIsFilterOpen(false)} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                Aplicar Filtros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.cardTypes.map((type) => (
            <Badge key={`cardType-${type}`} variant="secondary" className="rounded-full">
              Tipo: {type === "Monster" ? "Monstruo" : type === "Spell" ? "Mágica" : "Trampa"}
              <button
                onClick={() => toggleArrayFilter("cardTypes", type)}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.attributes.map((attribute) => (
            <Badge key={`attribute-${attribute}`} variant="secondary" className="rounded-full">
              Atributo: {attribute}
              <button
                onClick={() => toggleArrayFilter("attributes", attribute)}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.monsterTypes.map((type) => (
            <Badge key={`monsterType-${type}`} variant="secondary" className="rounded-full">
              Tipo: {type}
              <button
                onClick={() => toggleArrayFilter("monsterTypes", type)}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.spellTrapIcons.map((icon) => (
            <Badge key={`spellTrapIcon-${icon}`} variant="secondary" className="rounded-full">
              Tipo M/T: {icon}
              <button
                onClick={() => toggleArrayFilter("spellTrapIcons", icon)}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.subtypes.map((subtype) => (
            <Badge key={`subtype-${subtype}`} variant="secondary" className="rounded-full">
              Subtipo: {subtype}
              <button
                onClick={() => toggleArrayFilter("subtypes", subtype)}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
