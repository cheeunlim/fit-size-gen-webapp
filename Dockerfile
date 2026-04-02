# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./

# Install production dependencies only (express, cors, google-auth-library, dotenv)
RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "server.js"]
