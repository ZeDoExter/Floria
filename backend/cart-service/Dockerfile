FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY backend/shared ./backend/shared
RUN cd backend/shared && npm install && npm run build
COPY backend/cart-service/package.json backend/cart-service/package-lock.json* ./backend/cart-service/
RUN cd backend/cart-service && npm install

FROM base AS builder
COPY --from=deps /usr/src/app/backend/cart-service/node_modules ./backend/cart-service/node_modules
COPY --from=deps /usr/src/app/backend/shared ./backend/shared
COPY backend/cart-service ./backend/cart-service
RUN cd backend/cart-service && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY --from=deps /usr/src/app/backend/shared ./backend/shared
COPY backend/cart-service/package.json backend/cart-service/package-lock.json* ./backend/cart-service/
RUN cd backend/cart-service && npm install --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/backend/cart-service/dist ./backend/cart-service/dist

WORKDIR /usr/src/app/backend/cart-service
USER node
EXPOSE 3002
CMD ["node", "dist/main.js"]
