import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "Yugidex CRM - Gestión de Cartas Yu-Gi-Oh!",
  description: "Sistema de gestión para tu colección de cartas Yu-Gi-Oh!",
  generator: "v0.app",
  
  // --- INICIO DE LA CORRECCIÓN ---
  // Simplificamos el objeto de iconos para apuntar directamente 
  // a tu favicon.ico en la carpeta /public
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  // --- FIN DE LA CORRECCIÓN ---
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
