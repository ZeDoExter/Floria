FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN bun install && bun run build

FROM oven/bun:1
WORKDIR /app
COPY package.json ./
RUN bun install --production
COPY --from=build /app/dist ./dist
EXPOSE 3004
CMD ["bun", "dist/main.js"]
