import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // --- INICIO DE LA MODIFICACIÓN ---
  // Creamos un objeto 'profile' a partir de los metadatos del usuario.
  // Ya no necesitamos consultar la tabla "Users".
  const profile = {
    id: data.user.id,
    first_name: data.user.user_metadata?.first_name || "",
    last_name: data.user.user_metadata?.last_name || "",
    bio: data.user.user_metadata?.bio || "",
    location: data.user.user_metadata?.location || "",
    website: data.user.user_metadata?.website || "",
  }
  // --- FIN DE LA MODIFICACIÓN ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={data.user} />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-balance mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground text-pretty">Gestiona tu información personal y preferencias</p>
          </div>

          <ProfileForm user={data.user} profile={profile} />
        </div>
      </main>
    </div>
  )
}