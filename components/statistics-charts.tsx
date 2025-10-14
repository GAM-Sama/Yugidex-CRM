"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Sword, Sparkles, Shield, Star, Crown } from "lucide-react"

interface CardStat {
  card_type: string
  rarity?: string
  attribute?: string
  level?: number
  quantity: number
  monster_type?: string
}

interface StatisticsChartsProps {
  cardStats: CardStat[]
}

export function StatisticsCharts({ cardStats }: StatisticsChartsProps) {
  const getAttributeColor = (attribute: string) => {
    switch (attribute) {
      case "LIGHT":
        return "#fbbf24" // Amarillo dorado
      case "DARK":
        return "#6b21a8" // Púrpura oscuro
      case "WATER":
        return "#0ea5e9" // Azul agua
      case "FIRE":
        return "#dc2626" // Rojo fuego
      case "EARTH":
        return "#a3a3a3" // Gris tierra
      case "WIND":
        return "#10b981" // Verde viento
      case "DIVINE":
        return "#f59e0b" // Dorado divino
      default:
        return "#6b7280" // Gris por defecto
    }
  }

  const getSubtypeColor = (subtype: string) => {
    switch (subtype.toLowerCase()) {
      case "dragon":
        return "#dc2626" // Rojo dragón
      case "aqua":
        return "#0ea5e9" // Azul agua
      case "beast":
        return "#92400e" // Marrón bestia
      case "warrior":
        return "#7c2d12" // Marrón guerrero
      case "spellcaster":
        return "#7c3aed" // Púrpura mago
      case "fiend":
        return "#581c87" // Púrpura oscuro demonio
      case "zombie":
        return "#374151" // Gris zombie
      case "machine":
        return "#6b7280" // Gris máquina
      case "fairy":
        return "#f472b6" // Rosa hada
      case "insect":
        return "#65a30d" // Verde insecto
      case "plant":
        return "#16a34a" // Verde planta
      case "rock":
        return "#78716c" // Gris roca
      case "winged beast":
        return "#0891b2" // Azul bestia alada
      case "thunder":
        return "#eab308" // Amarillo trueno
      case "dinosaur":
        return "#a16207" // Marrón dinosaurio
      case "sea serpent":
        return "#0e7490" // Azul serpiente marina
      case "reptile":
        return "#059669" // Verde reptil
      case "fish":
        return "#0284c7" // Azul pez
      case "pyro":
        return "#ea580c" // Naranja fuego
      case "psychic":
        return "#c026d3" // Magenta psíquico
      case "divine-beast":
        return "#f59e0b" // Dorado bestia divina
      case "creator god":
        return "#fbbf24" // Dorado dios creador
      case "wyrm":
        return "#b91c1c" // Rojo wyrm
      case "cyberse":
        return "#06b6d4" // Cian cyberse
      default:
        return "#6b7280" // Gris por defecto
    }
  }

  // Procesar datos para gráficos
  const typeData = cardStats.reduce(
    (acc, card) => {
      const type = card.card_type || "Unknown"
      acc[type] = (acc[type] || 0) + (card.quantity || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const typeChartData = Object.entries(typeData).map(([type, count]) => ({
    type,
    count,
    fill: type === "Monster" ? "#f97316" : type === "Spell" ? "#22c55e" : "#ec4899",
  }))

  const rarityData = cardStats.reduce(
    (acc, card) => {
      const rarity = card.rarity || "Common"
      acc[rarity] = (acc[rarity] || 0) + (card.quantity || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const rarityChartData = Object.entries(rarityData).map(([rarity, count]) => ({
    rarity,
    count,
  }))

  const attributeData = cardStats
    .filter((card) => card.card_type === "Monster" && card.attribute)
    .reduce(
      (acc, card) => {
        const attribute = card.attribute!
        acc[attribute] = (acc[attribute] || 0) + (card.quantity || 0)
        return acc
      },
      {} as Record<string, number>,
    )

  const attributeChartData = Object.entries(attributeData).map(([attribute, count]) => ({
    attribute,
    count,
    fill: getAttributeColor(attribute),
  }))

  const levelData = cardStats
    .filter((card) => card.card_type === "Monster" && card.level)
    .reduce(
      (acc, card) => {
        const level = card.level!
        acc[level] = (acc[level] || 0) + (card.quantity || 0)
        return acc
      },
      {} as Record<string, number>,
    )

  const levelChartData = Object.entries(levelData)
    .map(([level, count]) => ({
      level: `Nivel ${level}`,
      count,
    }))
    .sort((a, b) => Number.parseInt(a.level.split(" ")[1]) - Number.parseInt(b.level.split(" ")[1]))

  const linkData = cardStats
    .filter((card) => card.card_type === "Monster" && card.level && card.level >= 1 && card.level <= 6)
    .reduce(
      (acc, card) => {
        const level = card.level!
        acc[level] = (acc[level] || 0) + (card.quantity || 0)
        return acc
      },
      {} as Record<string, number>,
    )

  const linkChartData = Object.entries(linkData)
    .map(([level, count]) => ({
      level: `Link ${level}`,
      count,
    }))
    .sort((a, b) => Number.parseInt(a.level.split(" ")[1]) - Number.parseInt(b.level.split(" ")[1]))

  const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

  const totalCards = cardStats.reduce((sum, card) => sum + (card.quantity || 0), 0)
  const monsterCards = typeData["Monster"] || 0
  const spellCards = typeData["Spell"] || 0
  const trapCards = typeData["Trap"] || 0

  const monsterTypeData = cardStats
    .filter((card) => card.card_type === "Monster" && card.monster_type)
    .reduce(
      (acc, card) => {
        const monsterType = card.monster_type!
        acc[monsterType] = (acc[monsterType] || 0) + (card.quantity || 0)
        return acc
      },
      {} as Record<string, number>,
    )

  const monsterTypeChartData = Object.entries(monsterTypeData)
    .map(([monsterType, count]) => ({
      monsterType,
      count,
      fill: getSubtypeColor(monsterType),
    }))
    .sort((a, b) => b.count - a.count) // Ordenar por cantidad descendente

  return (
    <div className="space-y-6">
      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cartas</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monstruos</CardTitle>
            <Sword className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monsterCards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalCards > 0 ? Math.round((monsterCards / totalCards) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mágicas</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{spellCards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalCards > 0 ? Math.round((spellCards / totalCards) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trampas</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{trapCards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalCards > 0 ? Math.round((trapCards / totalCards) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Carta</CardTitle>
            <CardDescription>Cantidad de cartas por cada tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico circular por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Proporción por Tipo</CardTitle>
            <CardDescription>Distribución porcentual de tu colección</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => {
                    const percentage = percent ? (percent * 100).toFixed(0) : 0;
                    return `${type} ${percentage}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {monsterTypeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Subtipos</CardTitle>
              <CardDescription>Tipos/razas de monstruos en tu colección</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monsterTypeChartData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monsterType" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {monsterTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de atributos con colores específicos */}
        {attributeChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monstruos por Atributo</CardTitle>
              <CardDescription>Distribución de atributos en monstruos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attributeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ attribute, percent }) => {
                      const percentage = percent ? (percent * 100).toFixed(0) : 0;
                      return `${attribute} ${percentage}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {attributeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico de niveles */}
      {levelChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel de Monstruo</CardTitle>
            <CardDescription>Cantidad de monstruos por nivel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={levelChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
                <Line type="monotone" dataKey="count" stroke="#f7d200" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Links */}
      {linkChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ratio de Enlace</CardTitle>
            <CardDescription>Distribución de Links por nivel (1-6)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={linkChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
                <Line type="monotone" dataKey="count" stroke="#f7d200" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay datos */}
      {totalCards === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay datos para mostrar</h3>
            <p className="text-muted-foreground text-center">
              Agrega algunas cartas a tu colección para ver las estadísticas aquí.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}