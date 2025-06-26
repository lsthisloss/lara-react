#!/bin/bash

set -e

host="$1"
port="$2"
user="$3"
password="$4"
database="$5"
shift 5
cmd="$@"

echo "Waiting for PostgreSQL at $host:$port..."

until PGPASSWORD=$password psql -h "$host" -p "$port" -U "$user" -d "$database" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - executing command"

# Run Laravel setup commands
php artisan key:generate --force
php artisan config:cache
php artisan route:cache
php artisan migrate --force
php artisan cache:clear

# Skip seeding for now to avoid Faker issues
# php artisan db:seed --force

exec $cmd
