FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY backend/shared ./backend/shared
RUN cd backend/shared && npm install && npm run build
COPY backend/gateway/package.json backend/gateway/package-lock.json* ./backend/gateway/
RUN cd backend/gateway && npm install

FROM base AS builder
COPY --from=deps /usr/src/app/backend/gateway/node_modules ./backend/gateway/node_modules
COPY --from=deps /usr/src/app/backend/shared ./backend/shared
COPY backend/gateway ./backend/gateway
RUN cd backend/gateway && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY --from=deps /usr/src/app/backend/shared ./backend/shared
COPY backend/gateway/package.json backend/gateway/package-lock.json* ./backend/gateway/
RUN cd backend/gateway && npm install --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/backend/gateway/dist ./backend/gateway/dist

WORKDIR /usr/src/app/backend/gateway
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]