FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY backend/shared ./backend/shared
RUN cd backend/shared && npm install && npm run build
COPY backend/payment-service/package.json backend/payment-service/package-lock.json* ./backend/payment-service/
RUN cd backend/payment-service && npm install

FROM base AS builder
COPY --from=deps /usr/src/app/backend/payment-service/node_modules ./backend/payment-service/node_modules
COPY --from=deps /usr/src/app/backend/shared ./backend/shared
COPY backend/payment-service ./backend/payment-service
RUN cd backend/payment-service && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY --from=deps /usr/src/app/backend/shared ./backend/shared
COPY backend/payment-service/package.json backend/payment-service/package-lock.json* ./backend/payment-service/
RUN cd backend/payment-service && npm install --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/backend/payment-service/dist ./backend/payment-service/dist

WORKDIR /usr/src/app/backend/payment-service
USER node
EXPOSE 3005
CMD ["node", "dist/main.js"]
