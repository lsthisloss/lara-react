#!/bin/bash
set -e

# Ждем готовности базы данных
echo "Waiting for database connection..."
php /var/www/html/wait-for-postgres.sh

# Автозапуск автолоадера
echo "Updating autoloader..."
composer dump-autoload --optimize

# Автозапуск миграций
echo "Running migrations..."
php artisan migrate --force

# Автозапуск сидеров (только если нет данных)
echo "Checking if seeding is needed..."
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();")
if [ "$USER_COUNT" -eq "0" ]; then
    echo "Seeding database..."
    php artisan db:seed --force
else
    echo "Database already seeded, skipping..."
fi

echo "Starting PHP-FPM..."
exec "$@"
