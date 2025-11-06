FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src
RUN npm install --legacy-peer-deps && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install --global serve
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
