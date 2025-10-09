// app/decks/page.tsx

import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { DeckSelectionModal } from "@/components/deck-selection-modal";
import { createClient } from "@/lib/supabase/server";
import { getUserDecks } from "@/lib/deck-service.server";
import type { Deck } from "@/types/deck";

export default async function DecksPage() {
  // 1. Creas el cliente aquí, donde SÍ tienes el contexto.
  const supabase = await createClient(); // createClient ya es async, no necesitas await

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // CAMBIO CLAVE: Pasas la instancia 'supabase' a la función de servicio.
  const userDecks: Deck[] = await getUserDecks(supabase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={user} />
      <main className="container mx-auto px-6 py-8">
        <DeckSelectionModal initialDecks={userDecks} />
      </main>
    </div>
  );
}