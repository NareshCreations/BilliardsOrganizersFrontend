# Production Dockerfile for Billiards Organizers Frontend

# Build stage
FROM node:22-alpine AS builder

ARG VITE_API_BASE_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .
# Render cloud specific
# RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cat /etc/secrets/.env
# Set environment variable for Vite build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
