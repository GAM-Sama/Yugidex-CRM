// app/decks/page.tsx

import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { DeckSelectionModal } from "@/components/deck-selection-modal";
import { createClient } from "@/lib/supabase/server";

// Importa la función DESDE EL ARCHIVO DE SERVIDOR que creamos
import { getUserDecks } from "@/lib/deck-service.server";
import type { Deck } from "@/types/deck";

export default async function DecksPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // 1. Se obtienen los datos aquí, en el servidor
  const userDecks: Deck[] = await getUserDecks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <main className="container mx-auto px-6 py-8">
        {/* 2. Se pasan los datos al componente de cliente como una prop */}
        <DeckSelectionModal initialDecks={userDecks} />
      </main>
    </div>
  );
}