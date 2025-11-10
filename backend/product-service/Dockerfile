FROM oven/bun:1 AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN bun install
RUN bun run build

FROM oven/bun:1
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN bun install --production
COPY --from=build /app/dist ./dist
EXPOSE 3002
CMD ["bun", "dist/main.js"]
