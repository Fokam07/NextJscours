# --- ÉTAPE 1 : BUILD ---
FROM node:20-alpine AS builder
WORKDIR /app

# Outils utiles (si un package a un build natif)
RUN apk add --no-cache libc6-compat python3 make g++ git

# ✅ Stabilise npm (réseau + moins de bruit)
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fund false \
 && npm config set audit false \
 && npm config set progress false \
 && npm config set fetch-retries 8 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000 \
 && npm config set fetch-timeout 300000

COPY package*.json ./

# ✅ évite audit/fund, et réduit les actions réseau
RUN npm ci --no-audit --no-fund --loglevel=warn

COPY . .

RUN npx prisma generate --schema=./backend/prisma/schema.prisma
RUN npm run build


# --- ÉTAPE 2 : RUNTIME ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/backend ./backend

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --schema=./backend/prisma/schema.prisma && npm start"]

