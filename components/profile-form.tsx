"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Save, UserIcon } from "lucide-react"

interface Profile {
  id: string
  first_name?: string
  last_name?: string
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
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [website, setWebsite] = useState(profile?.website || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("Users").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        bio,
        location,
        website,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al actualizar el perfil",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
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
          <CardTitle className="text-2xl">{firstName && lastName ? `${firstName} ${lastName}` : "Tu Perfil"}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Form */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ""} disabled className="rounded-xl bg-muted" />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl min-h-[100px]"
                placeholder="Cuéntanos sobre ti y tu pasión por Yu-Gi-Oh!"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl"
                placeholder="Tu ciudad o país"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="rounded-xl"
                placeholder="https://tu-sitio-web.com"
              />
            </div>

            {/* Message */}
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              disabled={isLoading}
            >
              {isLoading ? (
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

      {/* Account Stats */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Estadísticas de la Cuenta</CardTitle>
          <CardDescription>Información sobre tu actividad en Yugidex CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-primary/5">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Cartas en colección</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-accent/5">
              <div className="text-2xl font-bold text-accent">0</div>
              <div className="text-sm text-muted-foreground">Sets completados</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary/5">
              <div className="text-2xl font-bold text-secondary-foreground">$0</div>
              <div className="text-sm text-muted-foreground">Valor estimado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
