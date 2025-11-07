FROM oven/bun:1 AS build
WORKDIR /app
COPY prisma ./prisma
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN bun install
RUN bunx prisma@5.16.1 generate --schema prisma/schema.prisma
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY prisma ./prisma
COPY package.json ./
RUN bun install --production
RUN bunx prisma@5.16.1 generate --schema prisma/schema.prisma
COPY --from=build /app/dist ./dist
EXPOSE 3004
CMD ["bun", "dist/main.js"]
