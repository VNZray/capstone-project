# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.16.0
FROM node:${NODE_VERSION}

ENV NODE_ENV=development
WORKDIR /usr/src/app

# Install MariaDB client so mysqladmin is available
RUN apt-get update && apt-get install -y mariadb-client && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests first
COPY package*.json ./

RUN npm install

RUN npm install -g nodemon


# Copy app source code
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Use entrypoint instead of CMD
ENTRYPOINT ["./docker-entrypoint.sh"]
