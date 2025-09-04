# Build stage
FROM node:18.19.1-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM node:18.19.1-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Copy build output
COPY --from=builder /app/dist ./dist

# Copy wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Expose port
EXPOSE 3000

# Wait for MongoDB to be ready, then start the server
CMD ["/wait-for-it.sh", "mongo:27017", "--", "node", "dist/src/main"]
