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

# Create config and start service
RUN echo '{\n  "PORT": 3456,\n  "HOST": "0.0.0.0",\n  "APIKEY": "runweok",\n  "LOG": true,\n  "API_TIMEOUT_MS": 3000000,\n  "Providers": [\n    {\n      "name": "openrouter",\n      "apiKey": "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",\n      "baseURL": "https://openrouter.ai/api/v1/chat/completions"\n    }\n  ],\n  "Router": {\n    "defaultModels": "openai/gpt-oss-20b:free,z-ai/glm-4.5-air:free,qwen/qwen3-coder:free,moonshotai/kimi-k2:free",\n    "defaultRoute": "openai/gpt-oss-20b:free",\n    "backgroundRoute": "z-ai/glm-4.5-air:free",\n    "thinkRoute": "qwen/qwen3-coder:free",\n    "longcontextRoute": "moonshotai/kimi-k2:free",\n    "longcontextThreshold": 32000,\n    "websearchRoute": "openai/gpt-oss-20b:free"\n  }\n}' > /root/.claude-code-router/config.json

CMD ["sh", "-c", "rm -rf /root/.claude-code-router/.pid* && echo 'Starting service...' && node dist/cli.cjs start && echo 'Service started, keeping container alive...' && tail -f /dev/null"]
