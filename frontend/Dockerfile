# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

# Nginx config for SPA + /api reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
