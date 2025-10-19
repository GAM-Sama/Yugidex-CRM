"use client"

import type React from "react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription, // Importado para el subtítulo del modal
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("") // Nuevo estado para nombre de usuario
  const [agreedToTerms, setAgreedToTerms] = useState(false) // Estado para el checkbox
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    // Doble verificación por si acaso, aunque el botón debería estar deshabilitado
    if (!agreedToTerms) {
      setError("Debes aceptar los términos y condiciones para continuar")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            // Enviamos 'username' en lugar de 'first_name' y 'last_name'
            // Asegúrate de que tu tabla 'profiles' en Supabase tiene una columna 'username'
            username: username,
          },
        },
      })
      if (error) throw error
      router.push("/auth/register-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Yugidex CRM
          </h1>
          <p className="text-muted-foreground mt-2">Únete y gestiona tu colección</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Completa tus datos para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Campo de Nombre de Usuario */}
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="TuAlias"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Checkbox y Modal de Términos y Condiciones */}
              <Dialog>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal text-muted-foreground leading-snug"
                  >
                    He leído y acepto los{" "}
                    <DialogTrigger asChild>
                      <span className="text-primary hover:text-accent transition-colors font-medium cursor-pointer">
                        Términos de Uso y la Política de Privacidad
                      </span>
                    </DialogTrigger>
                    .
                  </Label>
                </div>

                <DialogContent className="sm:max-w-lg md:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Términos de Uso y Política de Privacidad</DialogTitle>
                    <DialogDescription>
                      Última actualización: 19 de octubre de 2025.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4 text-sm text-muted-foreground">
                    <p>
                      Bienvenido a Yugidex CRM (en adelante, "la Plataforma"). Al
                      crear una cuenta y utilizar nuestros servicios, usted (en
                      adelante, "el Usuario") acepta y se compromete a cumplir los
                      siguientes Términos de Uso y nuestra Política de Privacidad.
                    </p>

                    <h3 className="font-semibold text-foreground text-base pt-2">
                      1. Términos de Uso
                    </h3>
                    <ul className="list-disc list-outside pl-5 space-y-2">
                      <li>
                        <strong>Cuenta de Usuario:</strong> El Usuario es responsable
                        de mantener la confidencialidad de su contraseña y de todas
                        las actividades que ocurran bajo su cuenta. Se compromete a
                        proporcionar información veraz (nombre de usuario y email)
                        y a notificar cualquier uso no autorizado de su cuenta.
                      </li>
                      <li>
                        <strong>Uso Aceptable:</strong> La Plataforma se proporciona
                        para la gestión de colecciones personales. Queda prohibido
                        utilizarla para fines ilegales, fraudulentos o que infrinjan
                        los derechos de terceros.
                      </li>
                      <li>
                        <strong>Modificación del Servicio:</strong> Nos reservamos el
                        derecho de modificar o interrumpir el servicio (temporal o
                        permanentemente) con o sin previo aviso.
                      </li>
                    </ul>

                    <h3 className="font-semibold text-foreground text-base pt-2">
                      2. Política de Privacidad (Conforme al RGPD)
                    </h3>
                    <p>
                      En cumplimiento del Reglamento (UE) 2016/679 (RGPD), le
                      informamos sobre el tratamiento de sus datos personales.
                    </p>
                    <ul className="list-disc list-outside pl-5 space-y-2">
                      <li>
                        <strong>Responsable del Tratamiento:</strong> Yugidex CRM.
                        [Aquí deberías añadir tu Razón Social, NIF/CIF y dirección
                        fiscal o un email de contacto de DPO, p.ej:
                        privacidad@yugidex.com].
                      </li>
                      <li>
                        <strong>Datos Recopilados:</strong> Recopilaremos
                        exclusivamente su <strong>nombre de usuario</strong> y su
                        <strong>dirección de correo electrónico</strong>.
                      </li>
                      <li>
                        <strong>Finalidad y Legitimación del Tratamiento:</strong>
                        <ul className="list-decimal list-outside pl-6 mt-2 space-y-1">
                          <li>
                            <strong>Prestación del Servicio:</strong> Utilizaremos su
                            email y nombre de usuario para gestionar su cuenta,
                            permitirle el acceso a la plataforma, restaurar su
                            contraseña y enviarle comunicaciones transaccionales
                            esenciales sobre el estado del servicio.
                            <br />
                            <em>Base de legitimación:</em> Ejecución de un contrato
                            (los presentes Términos de Uso).
                          </li>
                          <li>
                            <strong>Comunicaciones Comerciales (Marketing):</strong>
                            Utilizaremos su dirección de correo electrónico para
                            enviarle publicidad, promociones y ofertas tanto
                            propias de Yugidex CRM como de{" "}
                            <strong>terceros colaboradores</strong> (por ejemplo,
                            tiendas de cartas, organizadores de torneos u otras
                            empresas del sector que consideremos de su interés).
                            <br />
                            <em>Base de legitimación:</em> Su{" "}
                            <strong>consentimiento explícito</strong>, que nos otorga
                            al marcar la casilla de aceptación durante el registro.
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>Cesión de Datos a Terceros:</strong> Al aceptar esta
                        política, usted consiente expresamente que podamos ceder su
                        dirección de correo electrónico (únicamente este dato) a las
                        mencionadas empresas colaboradoras del sector para que
                        puedan enviarle sus propias comunicaciones comerciales. No
                        cederemos su nombre de usuario ni su contraseña.
                      </li>
                      <li>
                        <strong>Plazo de Conservación:</strong> Sus datos se
                        conservarán mientras mantenga activa su cuenta en la
                        Plataforma. Si elimina su cuenta o ejerce su derecho de
                        supresión, sus datos serán bloqueados y posteriormente
                        eliminados, salvo obligación legal de conservarlos.
                      </li>
                      <li>
                        <strong>Sus Derechos (ARCO-POL):</strong> Usted tiene
                        derecho a:
                        <ul className="list-disc list-outside pl-6 mt-2 space-y-1">
                          <li>
                            Acceder, Rectificar o Suprimir sus datos.
                          </li>
                          <li>
                            Oponerse al tratamiento o solicitar su Limitación.
                          </li>
                          <li>
                            Solicitar la Portabilidad de sus datos.
                          </li>
                          <li>
                            <strong>
                              Retirar su consentimiento para fines comerciales en
                              cualquier momento
                            </strong>
                            , sin que ello afecte a la prestación del servicio
                            principal.
                          </li>
                        </ul>
                        Puede ejercer estos derechos enviando un correo a [tu email
                        de privacidad, ej: privacidad@yugidex.com].
                      </li>
                    </ul>

                    <h3 className="font-semibold text-foreground text-base pt-2">
                      3. Aceptación
                    </h3>
                    <p>
                      Al marcar la casilla de aceptación, usted declara haber leído,
                      comprendido y aceptado en su totalidad los presentes
Términos
                      de Uso y la Política de Privacidad, otorgando su
                      consentimiento explícito para el tratamiento de sus datos en
                      los términos descritos, incluida la recepción de
                      comunicaciones comerciales y la cesión de su email a
                      terceros colaboradores.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Botón de Registro */}
              <Button
                type="submit"
                className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                // Deshabilitado si está cargando O si no se han aceptado los términos
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}