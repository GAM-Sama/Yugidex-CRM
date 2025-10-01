import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Yugidex CRM
          </h1>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">¡Registro Exitoso!</CardTitle>
            <CardDescription>Revisa tu email para confirmar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace
              para activar tu cuenta.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/auth/login">Volver al Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
