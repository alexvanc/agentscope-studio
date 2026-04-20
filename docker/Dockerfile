# Stage 1: Build with official Node.js image
# FROM node:22-slim

# ARG DEBIAN_FRONTEND=noninteractive
# ENV PIP_BREAK_SYSTEM_PACKAGES=1
# # Install essential tools (without Node.js - will copy from builder)
# RUN apt-get update && apt-get install -y --fix-missing \
#     python3 python-is-python3 python3-pip \
#     curl procps ca-certificates build-essential git sqlite3 \
#     && pip install --no-cache-dir --upgrade pip \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Copy Python requirements and install
# COPY packages/app/requirements.txt /tmp/requirements.txt
# RUN pip install --no-cache-dir -r /tmp/requirements.txt \
#     && pip cache purge \
#     && rm /tmp/requirements.txt
FROM agentscope/studio:base

WORKDIR /app

# Copy workspace files
COPY packages/ ./packages/
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install 
RUN npm ci

COPY bin/ ./bin/

# Build the application
RUN npm run build

# Reinstall production dependencies only
# RUN npm ci --omit=dev

# Cleanup
RUN npm install mysql
# RUN npm cache clean --force 2>/dev/null || true \
#     && rm -rf ~/.npm/_cacache

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
COPY database.config.json ./database.config.json
RUN chmod +x /entrypoint.sh

# Runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    OTEL_GRPC_PORT=4317 \
    HOME=/app/data \
    LOG_LEVEL=warn \
    PYTHONUNBUFFERED=1

EXPOSE 3000 4317

ENTRYPOINT ["/entrypoint.sh"]
