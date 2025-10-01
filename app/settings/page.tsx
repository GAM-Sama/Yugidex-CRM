import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar user={data.user} />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-balance mb-2">Configuración</h1>
            <p className="text-muted-foreground text-pretty">Personaliza tu experiencia en Yugidex CRM</p>
          </div>

          <SettingsForm user={data.user} />
        </div>
      </main>
    </div>
  )
}
