import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { StatisticsCharts } from "@/components/statistics-charts"

export default async function StatisticsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: cardStats } = await supabase.from("Cartas").select("*")

  console.log("[v0] Fetched card statistics:", cardStats?.length || 0)

  const mappedCardStats =
    cardStats?.map((card) => ({
      card_type: card.Marco_Carta,
      rarity: card.Rareza,
      attribute: card.Atributo,
      level: card.Nivel_Rank_Link,
      monster_type: card.Tipo,
      quantity: 1, // Cada carta cuenta como 1 en lugar de usar campo Cantidad inexistente
    })) || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={data.user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Estadísticas de tu Colección</h1>
          <p className="text-muted-foreground">Visualiza el análisis detallado de tu colección de cartas Yu-Gi-Oh!</p>
        </div>

        <StatisticsCharts cardStats={mappedCardStats} />
      </main>
    </div>
  )
}
