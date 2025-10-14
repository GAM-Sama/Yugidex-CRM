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
  
  // --- INICIO DE LA MODIFICACIÓN ---
  icons: {
    // Icono para dispositivos Apple (pantalla de inicio)
    apple: '/apple-touch-icon.png',
    
    // Iconos para navegadores modernos (diferentes tamaños)
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    
    // Icono de acceso directo para navegadores antiguos
    shortcut: '/favicon.ico',
  },
  
  // Enlace al manifest para Android y PWA (si lo tienes)
  manifest: '/site.webmanifest',
  // --- FIN DE LA MODIFICACIÓN ---
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