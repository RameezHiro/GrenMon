FROM node:22.14.0-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:22.14.0-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4173
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs

EXPOSE 4173
CMD ["node", "server.mjs", "--root", "dist"]
