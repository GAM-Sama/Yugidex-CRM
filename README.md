# Yugidex CRM

## Descripción del Proyecto
Yugidex CRM es un sistema de gestión de relaciones con clientes desarrollado para complementar la aplicación móvil Yugidex. Esta plataforma está diseñada para ofrecer una solución integral en la gestión de usuarios, seguimiento de interacciones y administración de datos relacionados con el ecosistema Yugidex.

## Características Principales

- Gestión centralizada de usuarios y perfiles
- Panel de administración intuitivo
- Interfaz responsiva y accesible
- Integración con servicios en la nube
- Sistema de autenticación seguro
- Panel de análisis y reportes

## Tecnologías Utilizadas

### Frontend
- Next.js - Framework de React para aplicaciones web
- TypeScript - Lenguaje tipado que se compila a JavaScript
- Tailwind CSS - Framework CSS para diseño responsivo
- Radix UI - Biblioteca de componentes accesibles

### Backend
- Supabase - Plataforma de desarrollo de aplicaciones con autenticación y base de datos en tiempo real
- PostgreSQL - Sistema de gestión de bases de datos relacional

### Herramientas de Desarrollo
- ESLint - Para análisis estático de código
- Prettier - Formateador de código
- Git - Control de versiones

## Requisitos del Sistema

- Node.js (versión 15 o superior)
- npm (versión 9 o superior) o yarn
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Cuenta de Supabase

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/yugidex-crm.git
   cd yugidex-crm
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn
   ```

3. Configuración del entorno:
   Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

## Estructura del Proyecto

```
yugidex-crm/
├── components/     # Componentes reutilizables
├── lib/           # Utilidades y configuraciones
├── pages/         # Rutas de la aplicación
├── public/        # Archivos estáticos
├── styles/        # Estilos globales
└── types/         # Definiciones de TypeScript
```

## Capturas de Pantalla

**Dashboard**
![\[Incluir capturas de pantalla relevantes de la aplicación\]](https://github.com/GAM-Sama/Yugidex-CRM/blob/main/public/images/dashboard.PNG)

**Analitics**
![\[Incluir capturas de pantalla relevantes de la aplicación\]](https://github.com/GAM-Sama/Yugidex-CRM/blob/main/public/images/analitics.PNG)

![\[Incluir capturas de pantalla relevantes de la aplicación\]](https://github.com/GAM-Sama/Yugidex-CRM/blob/main/public/images/analitics-2.PNG)

**Gestion de decks**
![\[Incluir capturas de pantalla relevantes de la aplicación\]](https://github.com/GAM-Sama/Yugidex-CRM/blob/main/public/images/gestion-deck-1.PNG)

![\[Incluir capturas de pantalla relevantes de la aplicación\]](https://github.com/GAM-Sama/Yugidex-CRM/blob/main/public/images/gestion-deck-2.PNG)

**Ver cartas**
![\[Incluir capturas de pantalla relevantes de la aplicación\]](https://github.com/GAM-Sama/Yugidex-CRM/blob/main/public/images/ver-cartas.PNG)

## Licencia

Este es un proyecto personal sin licencia de código abierto. Todos los derechos están reservados.

## Contacto

Para consultas o soporte, por favor contactar a [gonzalo.a.m.1992@gmail.com](mailto:gonzalo.a.m.1992@gmail.com)