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
  // Construimos el objeto 'profile' leyendo 'username'
  // desde los metadatos del usuario.
  const profile = {
    id: data.user.id,
    // first_name: data.user.user_metadata?.first_name || "", // Eliminado
    // last_name: data.user.user_metadata?.last_name || "", // Eliminado
    username: data.user.user_metadata?.username || "", // Añadido
    bio: data.user.user_metadata?.bio || "",
    location: data.user.user_metadata?.location || "",
    website: data.user.user_metadata?.website || "",
    // Asegúrate de que la interfaz 'Profile' en ProfileForm también
    // tenga 'username' en lugar de 'first_name' y 'last_name'
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

          {/* Ahora le pasamos el objeto 'profile' con la propiedad 'username' 
            al componente ProfileForm que modificamos antes.
          */}
          <ProfileForm user={data.user} profile={profile} />
        </div>
      </main>
    </div>
  )
}