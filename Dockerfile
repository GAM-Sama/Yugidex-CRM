FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN corepack enable && pnpm install --frozen-lockfile

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación
RUN pnpm build

# Puerto de la aplicación
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Iniciar la aplicación
CMD ["pnpm", "start"]
