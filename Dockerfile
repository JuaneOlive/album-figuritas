# Multistage build para Album Mundial
# Stage 1: Dependencias
FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# Stage 2: Aplicación
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código
COPY . .

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "app.js"]
