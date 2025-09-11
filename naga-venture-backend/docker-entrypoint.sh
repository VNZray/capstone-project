#!/bin/sh
set -e

if [ "$RESET_DB" = "true" ]; then
  echo "⚡ Resetting database..."
  npm run resetdb
else
  echo "📦 Creating database..."
  npm run createdb
  echo "📦 Running migrations..."
  npm run latest
  echo "🌱 Running seeds..."
  npm run seed
fi

echo "🚀 Starting backend server..."

if [ "$NODE_ENV" = "production" ]; then
  echo "🔒 Production mode"
  npm run start   # normal node
else
  echo "🛠️ Development mode"
  npm run dev     # nodemon hot reload
fi
