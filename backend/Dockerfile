FROM php:8.2-fpm

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    git \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install minimal PHP extensions
RUN docker-php-ext-install pdo_pgsql zip intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install PostgreSQL client for wait script
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . /var/www/html

# Install composer dependencies (including dev dependencies for Faker)
RUN composer install --optimize-autoloader

# Make wait script executable
RUN chmod +x /var/www/html/wait-for-postgres.sh

# Set proper permissions for storage and bootstrap/cache directories
RUN chmod -R 777 /var/www/html/storage
RUN chmod -R 777 /var/www/html/bootstrap/cache

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["./wait-for-postgres.sh", "db", "5432", "laravel", "password", "laravel", "php-fpm"]
