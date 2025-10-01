"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { User } from "@supabase/supabase-js"
import { Settings, Moon, Sun, Bell, Shield, Palette } from "lucide-react"

interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  useEffect(() => {
    // Check current theme
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("yugidex-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setNotifications(settings.notifications ?? true)
      setAutoSave(settings.autoSave ?? true)
    }
  }, [])

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  const saveSettings = () => {
    const settings = {
      notifications,
      autoSave,
    }
    localStorage.setItem("yugidex-settings", JSON.stringify(settings))

    // Show success message (you could add a toast here)
    alert("Configuración guardada correctamente")
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

      {/* Notifications Settings */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones Push</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones sobre nuevas cartas y actualizaciones
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Datos y Sincronización
          </CardTitle>
          <CardDescription>Configura cómo se manejan tus datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Guardado Automático</Label>
              <p className="text-sm text-muted-foreground">Guarda automáticamente los cambios en tu colección</p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
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

      {/* Save Button */}
      <Button
        onClick={saveSettings}
        className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
      >
        <Settings className="h-4 w-4 mr-2" />
        Guardar Configuración
      </Button>
    </div>
  )
}
