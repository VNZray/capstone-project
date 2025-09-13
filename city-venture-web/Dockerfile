# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0
FROM node:${NODE_VERSION}

# Set environment
ENV NODE_ENV=development

# Create app directory
WORKDIR /usr/src/app

# Copy dependency manifests first
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm install

# Copy app source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev"]
