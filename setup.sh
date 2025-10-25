#!/bin/bash

# IntelligentForms - Next.js Setup Script
# This script helps you set up the Next.js monorepo

set -e

echo "========================================="
echo "IntelligentForms - Next.js Setup"
echo "========================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Check npm version
echo "Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo "❌ Error: npm 9 or higher is required"
    echo "   Current version: $(npm -v)"
    exit 1
fi
echo "✅ npm version: $(npm -v)"
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    if psql -U postgres -d intelligentforms -c "SELECT 1;" &> /dev/null 2>&1; then
        echo "✅ PostgreSQL is accessible"
    else
        echo "⚠️  Warning: Cannot connect to PostgreSQL with default credentials"
        echo "   Make sure PostgreSQL is running and credentials in .env are correct"
        echo "   You may need to create the database first:"
        echo "   psql -U postgres -c 'CREATE DATABASE intelligentforms;'"
    fi
else
    echo "⚠️  Warning: psql command not found"
    echo "   Make sure PostgreSQL is installed and running"
fi
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please update the DATABASE_URL in .env with your PostgreSQL credentials"
    echo ""
fi

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma Client
echo "Generating Prisma Client..."
npm run db:generate
echo "✅ Prisma Client generated"
echo ""

# Push database schema
echo "Pushing database schema..."
read -p "Do you want to push the schema to the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:push
    echo "✅ Database schema updated"
    echo ""

    # Seed database
    read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        echo "✅ Database seeded"
        echo ""
        echo "Test accounts created:"
        echo "  1. Admin:  admin@intelligentforms.com / admin123"
        echo "  2. Test:   test@intelligentforms.com / password123"
        echo "  3. Demo:   demo@intelligentforms.com / demo123"
        echo ""
        echo "Sample data includes:"
        echo "  • 3 users with different profiles"
        echo "  • 6 diverse forms (contact, survey, registration, etc.)"
        echo "  • 3 sample form submissions"
        echo ""
    fi
fi

echo "========================================="
echo "Setup Complete! 🎉"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Update .env with your configuration"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run start        - Start production server"
echo "  npm run db:studio    - Open Prisma Studio (database GUI)"
echo ""
echo "For more information, see README.md and MIGRATION_GUIDE.md"
echo ""
