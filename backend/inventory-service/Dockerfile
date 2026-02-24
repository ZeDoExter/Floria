FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY backend/shared ./backend/shared
COPY backend/inventory-service/package.json backend/inventory-service/package-lock.json* ./backend/inventory-service/
RUN cd backend/inventory-service && npm install

FROM base AS builder
COPY --from=deps /usr/src/app/backend/inventory-service/node_modules ./backend/inventory-service/node_modules
COPY backend/shared ./backend/shared
COPY backend/inventory-service ./backend/inventory-service
RUN cd backend/inventory-service && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY backend/shared ./backend/shared
COPY backend/inventory-service/package.json backend/inventory-service/package-lock.json* ./backend/inventory-service/
RUN cd backend/inventory-service && npm install --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/backend/inventory-service/dist ./backend/inventory-service/dist

WORKDIR /usr/src/app/backend/inventory-service
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
