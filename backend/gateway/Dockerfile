FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm install --legacy-peer-deps && npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
