FROM oven/bun:1 AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src
RUN bun install && bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN bun add --global serve@14.2.1
EXPOSE 4173
CMD ["bunx", "serve", "-s", "dist", "-l", "4173"]
