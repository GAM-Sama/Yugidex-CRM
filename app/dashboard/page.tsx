import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, BarChart3, Sword, Sparkles, Shield } from "lucide-react";

// --- PASO 1: DEFINIR LOS TIPOS (Esto está bien y nos da seguridad) ---
type RawCardData = {
  Nombre?: string;
  Marco_Carta?: 'Monster' | 'Spell' | 'Trap' | string;
  // Añade cualquier otra propiedad de la tabla 'Cartas' que necesites
  [key: string]: any; // Permite otras propiedades sin que TypeScript se queje
};

type UserCardFromDB = {
  cantidad: number;
  created_at: string;
  Cartas: RawCardData | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // --- PASO 2: REALIZAR LA CONSULTA Y APLICAR EL TIPO (Esto está bien) ---
  const { data, error: userCardsError } = await supabase
    .from('user_cards')
    .select(`
      cantidad,
      created_at,
      Cartas ( * ) 
    `)
    .eq('user_id', user.id);

  const userCardsData = data as UserCardFromDB[] | null;

  if (userCardsError) {
    console.error("Error fetching dashboard data:", userCardsError);
  }
  
  // --- PASO 3: FILTRAR PRIMERO, LUEGO TRANSFORMAR (¡LA CORRECCIÓN CLAVE!) ---
  const cardStats = (userCardsData || [])
    // 3.1: Filtramos para quedarnos solo con las filas que SÍ tienen datos de la carta
    .filter((userCard): userCard is UserCardFromDB & { Cartas: RawCardData } => userCard.Cartas !== null)
    // 3.2: Ahora que estamos 100% seguros de que 'userCard.Cartas' no es nulo, transformamos.
    .map(userCard => ({
      ...userCard.Cartas,
      card_type: userCard.Cartas.Marco_Carta,
      cantidad_usuario: userCard.cantidad,
      created_at: userCard.created_at,
    }));
  
  // --- PASO 4: CALCULAR ESTADÍSTICAS (Ahora funciona perfectamente) ---
  const totalCards = cardStats.reduce((sum, card) => sum + (card.cantidad_usuario || 0), 0);
  const monsterCards = cardStats.filter((card) => card.card_type === "Monster").reduce((sum, card) => sum + (card.cantidad_usuario || 0), 0);
  const spellCards = cardStats.filter((card) => card.card_type === "Spell").reduce((sum, card) => sum + (card.cantidad_usuario || 0), 0);
  const trapCards = cardStats.filter((card) => card.card_type === "Trap").reduce((sum, card) => sum + (card.cantidad_usuario || 0), 0);

  const recentCards = cardStats
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Bienvenido a tu Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            Gestiona tu colección de cartas Yu-Gi-Oh! de manera eficiente
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cartas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">En tu colección</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartas de Monstruos</CardTitle>
              <Sword className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monsterCards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Normales, Fusiones, XYZ, etc.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartas Mágicas</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spellCards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Hechizos y efectos</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartas Trampa</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trapCards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Trampas y contraataques</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Ver Cartas</CardTitle>
              <CardDescription>Explora y gestiona tu colección completa de cartas Yu-Gi-Oh!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full rounded-xl bg-primary hover:bg-primary/90">
                <Link href="/cards">Explorar Colección</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/15 hover:to-accent/10 transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <Sword className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Gestión de Decks</CardTitle>
              <CardDescription>Crea, edita y gestiona tus decks de Yu-Gi-Oh!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full rounded-xl border-accent/20 hover:bg-accent/10 bg-transparent">
                <Link href="/decks">Gestionar Decks</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-secondary/10 to-secondary/5 hover:from-secondary/15 hover:to-secondary/10 transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                <BarChart3 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Estadísticas</CardTitle>
              <CardDescription>Analiza el valor y distribución de tu colección</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full rounded-xl bg-transparent">
                <Link href="/statistics">Ver Estadísticas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en tu colección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCards.length > 0 ? (
                  recentCards.map((card, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-primary/5">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Carta agregada: {card.Nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.created_at
                            ? new Date(card.created_at).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Fecha no disponible"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">No hay actividad reciente</p>
                      <p className="text-xs text-muted-foreground">Agrega algunas cartas para ver la actividad</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}