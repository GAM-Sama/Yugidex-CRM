"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { User } from "@supabase/supabase-js"
import { Moon, Sun, Shield, Palette } from "lucide-react"

interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Comprueba el tema actual al cargar el componente
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    // Guarda el tema en localStorage para persistencia
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Modo Oscuro</Label>
              <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad de la Cuenta
          </CardTitle>
          <CardDescription>Información sobre tu cuenta y seguridad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email de la Cuenta</Label>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground">{user.email}</div>
          </div>

          <div className="space-y-2">
            <Label>Última Conexión</Label>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground">
              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("es-ES") : "Nunca"}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cuenta Creada</Label>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground">
              {new Date(user.created_at).toLocaleString("es-ES")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}