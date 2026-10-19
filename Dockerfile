FROM node:22.14.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4173
CMD ["node", "server.mjs", "--root", "dist"]
