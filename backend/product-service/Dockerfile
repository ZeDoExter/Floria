FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY prisma ./prisma
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm install --legacy-peer-deps
RUN npx prisma@5.16.1 generate --schema prisma/schema.prisma
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY prisma ./prisma
COPY package.json ./
RUN npm install --legacy-peer-deps --omit=dev
RUN npx prisma@5.16.1 generate --schema prisma/schema.prisma
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
