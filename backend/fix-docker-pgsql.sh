#!/bin/bash

# Show colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing PostgreSQL driver in Docker container...${NC}"

# Create improved Dockerfile that properly installs PostgreSQL drivers
cat > Dockerfile.improved << 'EOL'
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-client

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . /var/www/html

# Install composer dependencies
RUN composer install --optimize-autoloader

# Make wait script executable
RUN chmod +x /var/www/html/wait-for-postgres.sh

# Set proper permissions for storage and bootstrap/cache directories
RUN chmod -R 777 /var/www/html/storage
RUN chmod -R 777 /var/www/html/bootstrap/cache

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["./wait-for-postgres.sh", "db", "5432", "laravel", "password", "laravel", "php-fpm"]
EOL

echo -e "${GREEN}✓ Improved Dockerfile created${NC}"
echo -e "${YELLOW}To rebuild your Docker container with PostgreSQL support, run:${NC}"
echo -e "${YELLOW}   mv Dockerfile.improved Dockerfile${NC}"
echo -e "${YELLOW}   cd ..${NC}"
echo -e "${YELLOW}   docker-compose down${NC}"
echo -e "${YELLOW}   docker-compose build --no-cache backend${NC}"
echo -e "${YELLOW}   docker-compose up -d${NC}"
echo -e "${YELLOW}This will require Docker to be properly set up on your system.${NC}"
