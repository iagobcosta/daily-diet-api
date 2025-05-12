# Etapa 1: build da aplicação (TypeScript → JavaScript)
FROM node:18-alpine AS builder

WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install

# Copia todo o restante do código
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Etapa 2: imagem final para produção (leve e rápida) 
FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário da etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copiar o arquivo de configuração do knex para o container
COPY --from=builder /app/knexfile.js ./knexfile.js

# Copia arquivos de ambiente, se necessário
# COPY .env.production .env.production

ENV NODE_ENV=production
EXPOSE 3333

# Inicia a API
CMD ["node", "dist/server.js"]
