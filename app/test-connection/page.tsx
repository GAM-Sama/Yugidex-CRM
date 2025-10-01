"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function TestConnectionPage() {
  const [status, setStatus] = useState({
    envVars: "checking",
    connection: "checking",
    tables: "checking",
    error: "",
    details: "",
  })

  const checkConnection = async () => {
    setStatus({ envVars: "checking", connection: "checking", tables: "checking", error: "", details: "" })

    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!hasUrl || !hasKey) {
      setStatus({
        envVars: "missing",
        connection: "error",
        tables: "error",
        error: "Variables de entorno faltantes",
        details: "Verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas en Vercel.",
      })
      return
    }

    setStatus((prev) => ({ ...prev, envVars: "ok" }))

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.getSession()

      if (error && error.message.includes("Invalid API key")) {
        setStatus((prev) => ({
          ...prev,
          connection: "error",
          tables: "error",
          error: "Credenciales inválidas",
          details: `Error de autenticación: ${error.message}. Verifica que tu ANON_KEY sea correcta.`,
        }))
        return
      }

      // Try a simple query to test connection
      const { error: connectionError } = await supabase.from("_supabase_migrations").select("version").limit(1)

      if (connectionError && connectionError.code === "PGRST116") {
        // Table doesn't exist, but connection works
        setStatus((prev) => ({ ...prev, connection: "connected" }))
      } else if (connectionError) {
        setStatus((prev) => ({
          ...prev,
          connection: "error",
          tables: "error",
          error: "Error de conexión",
          details: `${connectionError.message} (Código: ${connectionError.code})`,
        }))
        return
      } else {
        setStatus((prev) => ({ ...prev, connection: "connected" }))
      }

      const requiredTables = ["Users", "Cartas", "user_cards"]
      let tablesOk = true
      const tableErrors = []

      for (const table of requiredTables) {
        try {
          const { error: tableError } = await supabase.from(table).select("count").limit(1)
          if (tableError) {
            tablesOk = false
            if (tableError.code === "PGRST116") {
              tableErrors.push(`${table}: Tabla no existe`)
            } else {
              tableErrors.push(`${table}: ${tableError.message}`)
            }
          }
        } catch (err) {
          tablesOk = false
          tableErrors.push(`${table}: Error de acceso`)
        }
      }

      setStatus((prev) => ({
        ...prev,
        tables: tablesOk ? "ok" : "error",
        error: tableErrors.length > 0 ? "Tablas faltantes" : "",
        details: tableErrors.length > 0 ? `Problemas: ${tableErrors.join(", ")}` : "",
      }))
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        connection: "error",
        tables: "error",
        error: "Error de cliente",
        details: `${error instanceof Error ? error.message : "Error desconocido"}`,
      }))
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "ok":
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
      case "missing":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "checking":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const variant =
      status === "ok" || status === "connected"
        ? "default"
        : status === "error" || status === "missing"
          ? "destructive"
          : "secondary"

    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Diagnóstico de Conexión Supabase</h1>
          <p className="text-muted-foreground text-pretty">Verificando la conectividad con tu base de datos externa</p>

          <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={checkConnection}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar Diagnóstico
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon status={status.envVars} />
                <CardTitle>Variables de Entorno</CardTitle>
              </div>
              <CardDescription>Verificación de credenciales de Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge status={status.envVars} />
              {status.envVars === "missing" && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Solución:</strong> Configura las variables en Vercel y haz un nuevo deployment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon status={status.connection} />
                <CardTitle>Estado de Conexión</CardTitle>
              </div>
              <CardDescription>Conectividad con Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge status={status.connection} />
            </CardContent>
          </Card>

          {/* Database Tables */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon status={status.tables} />
                <CardTitle>Tablas Requeridas</CardTitle>
              </div>
              <CardDescription>Acceso a las tablas de tu base de datos existente</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge status={status.tables} />
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Tablas requeridas: Users, Cartas, user_cards</p>
              </div>
              {status.tables === "error" && status.details.includes("no existe") && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Información:</strong> Algunas tablas no existen en tu base de datos. Verifica que las tablas
                    Users, Cartas y user_cards estén creadas en tu Supabase.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {(status.error || status.details) && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Detalles del Error</CardTitle>
              </CardHeader>
              <CardContent>
                {status.error && <p className="text-sm font-medium text-red-600 mb-2">{status.error}</p>}
                {status.details && <p className="text-sm text-red-600">{status.details}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
