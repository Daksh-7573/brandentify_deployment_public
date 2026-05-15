#!/bin/bash
set -e

echo "========================================="
echo "🚀 DEPLOYMENT BUILD SCRIPT"
echo "========================================="

echo "📦 Step 1: Syncing database schema..."
npm run db:push

echo "✅ Schema sync complete!"

echo "🔨 Step 2: Building application..."
npm run build

echo "========================================="
echo "✅ DEPLOYMENT BUILD COMPLETE"
echo "========================================="
