"use client"

import type React from "react"
import { useState, useTransition } from "react"
// --- INICIO CAMBIOS ---
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" // Importamos el CLIENTE
// --- FIN CAMBIOS ---
import { updateUserProfile } from "@/app/profile/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@supabase/supabase-js"
import { Save, UserIcon } from "lucide-react"

// (La interfaz 'Profile' debe estar como la definimos antes, con 'username')
interface Profile {
  id: string
  username?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
}

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [username, setUsername] = useState(profile?.username || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [website, setWebsite] = useState(profile?.website || "")

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // --- INICIO CAMBIOS ---
  const router = useRouter()
  const supabase = createClient() // Creamos la instancia del cliente
  // --- FIN CAMBIOS ---

  const handleSubmit = (formData: FormData) => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateUserProfile(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      }

      if (result.success) {
        setMessage({ type: "success", text: result.success })

        // --- INICIO CAMBIOS ---
        // ¡ESTA ES LA PARTE CLAVE!
        // 1. Forzamos al cliente a refrescar su sesión (cookie)
        //    para obtener el nuevo user_metadata.
        await supabase.auth.refreshSession()

        // 2. Le decimos a Next.js que refresque la ruta actual.
        //    Esto re-ejecutará el Server Component 'ProfilePage'
        //    que ahora leerá el NUEVO cookie.
        router.refresh()
        // --- FIN CAMBIOS ---
      }
    })
  }

  const getUserInitials = () => {
    if (username) {
      return username[0].toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{username ? username : "Tu Perfil"}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Form (el resto del formulario no cambia) */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="id" value={user.id} />

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl"
                placeholder="Tu nombre de usuario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ""} disabled className="rounded-xl bg-muted" />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl min-h-[100px]"
                placeholder="Cuéntanos sobre ti y tu pasión por Yu-Gi-Oh!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl"
                placeholder="Tu ciudad o país"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="rounded-xl"
                placeholder="https://tu-sitio-web.com"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl border ${
                  message.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              disabled={isPending}
            >
              {isPending ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}