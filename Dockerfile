# syntax=docker/dockerfile:1
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install flyctl CLI for app/secrets management
RUN apk add --no-cache curl bash && \
    curl -L https://fly.io/install.sh | sh && \
    mv /root/.fly/bin/flyctl /usr/local/bin/flyctl && \
    chmod +x /usr/local/bin/flyctl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY src ./src
COPY public ./public

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S shopsaas -u 1001

# Change ownership of app directory and ensure flyctl is accessible
RUN chown -R shopsaas:nodejs /app && \
    chmod 755 /usr/local/bin/flyctl

USER shopsaas

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# Start application
CMD ["npm", "start"]
