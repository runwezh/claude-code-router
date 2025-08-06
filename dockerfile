# Multi-stage build for better ARM64 compatibility
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the main application using Docker-specific build script
RUN node scripts/build-docker.js

# Use a fresh node image for the final stage
FROM node:20-slim

WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy package files for runtime
COPY package.json ./
COPY package-lock.json ./

# Install only runtime dependencies
RUN npm install --production

# Create .claude-code-router directory
RUN mkdir -p /root/.claude-code-router

# Expose port
EXPOSE ${ROUTER_PORT:-3456}

# Start the router service
CMD ["node", "dist/cli.cjs", "start"]
