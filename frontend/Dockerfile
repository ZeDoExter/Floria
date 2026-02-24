FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS builder
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN npm install -g serve
COPY --from=builder /usr/src/app/dist ./dist

USER node
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]