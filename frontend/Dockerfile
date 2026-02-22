# use the official Bun image
FROM dhi.io/bun:1.3.9 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules

# Copy configuration files and source code
COPY package.json tsconfig.json tsconfig.node.json vite.config.ts index.html tailwind.config.ts ./
COPY src ./src

# Build the React app
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NODE_ENV=production
RUN bun run build

# copy production artifacts into final image
FROM base AS release
# We only need the dist folder from the build stage for serving
COPY --from=build /usr/src/app/dist ./dist

# switch to non-root user (provided by oven/bun) before installing global packages
USER bun
RUN bun add --global serve@14.2.1

EXPOSE 4173/tcp

# run the app
ENTRYPOINT ["bunx", "serve", "-s", "dist", "-l", "4173"]