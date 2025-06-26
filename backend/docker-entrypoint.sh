#!/bin/bash
set -e

echo "🚀 Starting Laravel Backend Container..."

# Ensure we have .env file
if [ ! -f .env ]; then
    echo "📋 Copying .env.example to .env"
    cp .env.example .env
fi

# Wait for database
echo "⏳ Waiting for database connection..."
timeout=60
counter=0

while ! pg_isready -h db -p 5432 -U laravel >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database connection timeout after ${timeout}s"
        exit 1
    fi
    echo "🔄 Waiting for database... (${counter}s/${timeout}s)"
    sleep 2
    counter=$((counter + 2))
done

echo "✅ Database is ready!"

# Generate app key if not exists
if ! grep -q "APP_KEY=base64:" .env; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Verify and optimize autoloader
echo "🔧 Installing and optimizing composer dependencies..."
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    composer install --no-dev --optimize-autoloader --no-interaction
fi
composer dump-autoload --optimize --classmap-authoritative --no-interaction

# Clear caches that don't require database
echo "🧹 Clearing basic caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations first
echo "🗄️ Running migrations..."
php artisan migrate --force

# Now clear cache that requires database
echo "🧹 Clearing database cache..."
php artisan cache:clear

# Seed database if empty
echo "🌱 Checking if database seeding is needed..."
if ! php artisan tinker --execute="echo App\\Models\\User::count();" 2>/dev/null | grep -q "[1-9]"; then
    echo "🌱 Seeding database..."
    php artisan db:seed --force
else
    echo "✅ Database already has data, skipping seeding"
fi

# Cache configuration for production
echo "⚡ Caching configuration..."
php artisan config:cache
php artisan route:cache

echo "🎉 Laravel backend is ready!"
echo "📍 API available at: http://localhost:8000/api"

# Start PHP-FPM
exec "$@"
