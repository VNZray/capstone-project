# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0
FROM node:${NODE_VERSION}-alpine

# Set environment
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Copy dependency manifests first
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy app source code
COPY . .

# Expose Vite/React dev server port
EXPOSE 5173

# Use node user for security
USER node

# Start the app (adjust if using Vite/Expo/Next.js)
CMD ["npx", "expo", "start"]
