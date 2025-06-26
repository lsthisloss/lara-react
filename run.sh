#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m' 
NORMAL='\033[0m'

function app_check_autoload() {
    echo -e "${CYAN}Checking Composer autoload...${NORMAL}"
    
    # Проверяем наличие autoload файлов
    if [ ! -f backend/vendor/autoload.php ]; then
        echo -e "${RED}❌ Composer autoload not found. Installing dependencies...${NORMAL}"
        docker compose exec backend composer install --no-dev --optimize-autoloader
    fi
    
    # Проверяем актуальность autoload
    if [ backend/composer.json -nt backend/vendor/autoload.php ]; then
        echo -e "${YELLOW}⚠️ Composer.json is newer than autoload. Updating...${NORMAL}"
        docker compose exec backend composer dump-autoload --optimize
    fi
    
    # Проверяем класс автозагрузки
    if ! docker compose exec backend php -r "require 'vendor/autoload.php'; echo 'Autoload OK';" 2>/dev/null; then
        echo -e "${RED}❌ Autoload check failed. Regenerating...${NORMAL}"
        docker compose exec backend composer dump-autoload --optimize
    else
        echo -e "${GREEN}✅ Autoload is working correctly${NORMAL}"
    fi
}

function app_diagnose_autoload() {
    echo -e "\n${YELLOW}Diagnosing autoload issues...${NORMAL}\n"
    
    # Проверяем что backend контейнер запущен
    if ! docker compose ps backend | grep -q "Up"; then
        echo -e "${RED}❌ Backend container is not running${NORMAL}"
        echo -e "${CYAN}Starting backend container...${NORMAL}"
        docker compose up -d backend
        sleep 5
    fi
    
    echo -e "${CYAN}1. Checking composer.json...${NORMAL}"
    if [ -f backend/composer.json ]; then
        echo -e "${GREEN}✅ composer.json exists${NORMAL}"
    else
        echo -e "${RED}❌ composer.json not found${NORMAL}"
        return 1
    fi
    
    echo -e "${CYAN}2. Checking vendor directory...${NORMAL}"
    if [ -d backend/vendor ]; then
        echo -e "${GREEN}✅ vendor directory exists${NORMAL}"
    else
        echo -e "${RED}❌ vendor directory not found${NORMAL}"
        echo -e "${CYAN}Installing dependencies...${NORMAL}"
        docker compose exec backend composer install --no-dev --optimize-autoloader
    fi
    
    echo -e "${CYAN}3. Checking autoload.php...${NORMAL}"
    if [ -f backend/vendor/autoload.php ]; then
        echo -e "${GREEN}✅ autoload.php exists${NORMAL}"
    else
        echo -e "${RED}❌ autoload.php not found${NORMAL}"
        echo -e "${CYAN}Regenerating autoload...${NORMAL}"
        docker compose exec backend composer dump-autoload --optimize
    fi
    
    echo -e "${CYAN}4. Testing autoload functionality...${NORMAL}"
    if docker compose exec backend php -r "require 'vendor/autoload.php'; echo 'Autoload test passed';" 2>/dev/null; then
        echo -e "${GREEN}✅ Autoload is working${NORMAL}"
    else
        echo -e "${RED}❌ Autoload test failed${NORMAL}"
        echo -e "${CYAN}Attempting to fix...${NORMAL}"
        docker compose exec backend composer install --no-dev --optimize-autoloader
        docker compose exec backend composer dump-autoload --optimize
    fi
    
    echo -e "${CYAN}5. Checking Laravel app classes...${NORMAL}"
    if docker compose exec backend php artisan tinker --execute='echo "Laravel classes loaded successfully";' 2>/dev/null; then
        echo -e "${GREEN}✅ Laravel classes are accessible${NORMAL}"
    else
        echo -e "${RED}❌ Laravel classes failed to load${NORMAL}"
        echo -e "${CYAN}Clearing caches and regenerating...${NORMAL}"
        docker compose exec backend php artisan config:clear || true
        docker compose exec backend php artisan cache:clear || true
        docker compose exec backend composer dump-autoload --optimize
    fi
}

function app_fix_autoload() {
    echo -e "\n${YELLOW}Fixing autoload issues...${NORMAL}\n"
    
    # Убеждаемся что контейнер запущен
    if ! docker compose ps backend | grep -q "Up"; then
        echo -e "${CYAN}Starting backend container...${NORMAL}"
        docker compose up -d backend
        sleep 5
    fi
    
    echo -e "${CYAN}Step 1: Clearing all caches...${NORMAL}"
    docker compose exec backend php artisan config:clear || true
    docker compose exec backend php artisan cache:clear || true
    docker compose exec backend php artisan route:clear || true
    docker compose exec backend php artisan view:clear || true
    
    echo -e "${CYAN}Step 2: Removing vendor directory...${NORMAL}"
    docker compose exec backend rm -rf vendor/
    
    echo -e "${CYAN}Step 3: Installing dependencies fresh...${NORMAL}"
    docker compose exec backend composer install --no-dev --optimize-autoloader --no-interaction
    
    echo -e "${CYAN}Step 4: Optimizing autoloader...${NORMAL}"
    docker compose exec backend composer dump-autoload --optimize --no-interaction
    
    echo -e "${CYAN}Step 5: Testing installation...${NORMAL}"
    if docker compose exec backend php artisan --version; then
        echo -e "${GREEN}✅ Laravel is working correctly${NORMAL}"
    else
        echo -e "${RED}❌ Laravel still has issues${NORMAL}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Autoload fixed successfully!${NORMAL}"
}

function app_wait_for_services() {
    echo -e "${CYAN}Waiting for services to be ready...${NORMAL}"
    
    # Ждем готовности базы данных
    local db_ready=false
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ] && [ "$db_ready" = false ]; do
        if docker compose exec db pg_isready -U laravel -d laravel >/dev/null 2>&1; then
            db_ready=true
            echo -e "${GREEN}✅ Database is ready${NORMAL}"
        else
            echo -e "${YELLOW}⏳ Waiting for database... ($((attempts + 1))/$max_attempts)${NORMAL}"
            sleep 2
            attempts=$((attempts + 1))
        fi
    done
    
    if [ "$db_ready" = false ]; then
        echo -e "${RED}❌ Database failed to start after $max_attempts attempts${NORMAL}"
        return 1
    fi
    
    # Ждем готовности backend
    local backend_ready=false
    attempts=0
    
    while [ $attempts -lt $max_attempts ] && [ "$backend_ready" = false ]; do
        if docker compose exec backend php artisan tinker --execute='echo "Backend ready";' >/dev/null 2>&1; then
            backend_ready=true
            echo -e "${GREEN}✅ Backend is ready${NORMAL}"
        else
            echo -e "${YELLOW}⏳ Waiting for backend... ($((attempts + 1))/$max_attempts)${NORMAL}"
            sleep 2
            attempts=$((attempts + 1))
        fi
    done
    
    if [ "$backend_ready" = false ]; then
        echo -e "${RED}❌ Backend failed to start after $max_attempts attempts${NORMAL}"
        return 1
    fi
}

function app_start_dev() {
    echo -e "\n${YELLOW}Starting development environment...${NORMAL}\n"
    
    # Копируем .env файлы если их нет
    if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        echo -e "${CYAN}✅ Copied backend/.env.example to backend/.env${NORMAL}"
    fi

    if [ -f frontend/.env.example ] && [ ! -f frontend/.env ]; then
        cp frontend/.env.example frontend/.env
        echo -e "${CYAN}✅ Copied frontend/.env.example to frontend/.env${NORMAL}"
    fi

    echo -e "${CYAN}Starting Docker containers...${NORMAL}"
    
    # Останавливаем старые контейнеры
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Собираем и запускаем
    docker compose up --build
    
    # Ждем готовности сервисов
    if ! app_wait_for_services; then
        echo -e "${RED}❌ Failed to start services${NORMAL}"
        return 1
    fi
    
    # Генерируем ключ приложения если его нет
    if ! grep -q "APP_KEY=base64:" backend/.env; then
        echo -e "${CYAN}Generating application key...${NORMAL}"
        docker compose exec backend php artisan key:generate --ansi
    fi
    
    # Проверяем и исправляем автозагрузку
    app_check_autoload
    
    # Выполняем миграции и сидеры
    echo -e "${CYAN}Running migrations and seeders...${NORMAL}"
    docker compose exec backend php artisan migrate --force
    docker compose exec backend php artisan db:seed --force
    
    echo -e "\n${GREEN}✅ Development environment ready!${NORMAL}"
    echo -e "${CYAN}Frontend: http://localhost:3000${NORMAL}"
    echo -e "${CYAN}Backend: http://localhost:8000/api${NORMAL}"
    echo -e "${CYAN}Database: localhost:5432${NORMAL}"
    echo -e "${CYAN}Admin: admin@dev.pro / password${NORMAL}"
    
    # Показываем логи
    docker compose logs -f
}

function app_setup_local() {
    echo -e "\n${YELLOW}Installing local dependencies...${NORMAL}\n"
    
    # Копируем .env файлы
    if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        echo -e "${CYAN}Copied backend/.env.example to backend/.env${NORMAL}"
    fi

    if [ -f frontend/.env.example ] && [ ! -f frontend/.env ]; then
        cp frontend/.env.example frontend/.env
        echo -e "${CYAN}Copied frontend/.env.example to frontend/.env${NORMAL}"
    fi
    
    # Backend dependencies
    echo -e "${CYAN}Installing backend dependencies...${NORMAL}"
    cd backend
    composer install --no-dev --optimize-autoloader
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend dependencies installed${NORMAL}"
    else
        echo -e "${RED}❌ Backend dependencies installation failed${NORMAL}"
    fi
    cd ..
    
    # Frontend dependencies
    echo -e "${CYAN}Installing frontend dependencies...${NORMAL}"
    cd frontend
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NORMAL}"
    else
        echo -e "${RED}❌ Frontend dependencies installation failed${NORMAL}"
    fi
    cd ..
    
    echo -e "\n${GREEN}✅ Local dependencies installed!${NORMAL}"
}

function app_stop() {
    echo -e "\n${YELLOW}Stopping containers...${NORMAL}\n"
    docker compose down --timeout 10
    echo -e "${GREEN}All containers stopped!${NORMAL}"
}

function app_logs() {
    echo -e "\n${YELLOW}Showing logs...${NORMAL}\n"
    docker compose logs --tail=50 -f
}

function app_clean() {
    echo -e "\n${YELLOW}Cleaning project containers and volumes...${NORMAL}\n"
    
    # Останавливаем и удаляем контейнеры
    docker compose down --timeout 10 --remove-orphans --volumes
    
    # Удаляем связанные volume'ы
    docker volume rm laravel-react-app_dbdata 2>/dev/null || true
    
    # Очищаем Docker cache
    docker builder prune -f 2>/dev/null || true
    
    echo -e "${GREEN}✅ Project cleanup complete!${NORMAL}"
}

function app_reset_db() {
    echo -e "\n${YELLOW}Resetting database...${NORMAL}\n"
    
    # Останавливаем контейнеры
    docker compose down
    
    # Удаляем volume базы данных
    docker volume rm laravel-react-app_dbdata 2>/dev/null || true
    
    # Запускаем заново
    docker compose up db
    
    # Ждем готовности базы
    echo -e "${CYAN}Waiting for database...${NORMAL}"
    sleep 10
    
    # Запускаем миграции
    docker compose exec backend php artisan migrate:fresh --seed
    
    echo -e "${GREEN}✅ Database reset complete!${NORMAL}"
}

function app_migrate_seed() {
    echo -e "\n${YELLOW}Running migrations and seeders...${NORMAL}\n"
    
    # Проверяем что контейнеры запущены
    if ! docker compose ps backend | grep -q "Up"; then
        echo -e "${RED}Backend container is not running. Please start containers first.${NORMAL}"
        return 1
    fi
    
    # Проверяем и исправляем автозагрузку
    app_check_autoload
    
    # Выполняем миграции
    echo -e "${CYAN}Running migrations...${NORMAL}"
    docker compose exec backend php artisan migrate --force
    
    # Выполняем сидеры
    echo -e "${CYAN}Running seeders...${NORMAL}"
    docker compose exec backend php artisan db:seed --force
    
    echo -e "${GREEN}✅ Migrations and seeders completed!${NORMAL}"
    echo -e "${CYAN}Admin: admin@dev.pro / password${NORMAL}"
}


# Simple menu: 1 - Docker up, 2 - Local deps, 3 - Stop, 4 - Clean project, 5 - View logs
echo "  -------------------------------  "
echo "  1 - Start Docker Environment"
echo "  2 - Install Local Dependencies"
echo "  3 - Stop All Containers"
echo "  4 - Clean Project (containers, volumes)"
echo "  5 - View Live Logs"
echo "  6 - Reset Database & Fresh Start"
echo "  -------------------------------  "
echo -e "${CYAN}Input action number > ${NORMAL}"

read -p "" choice

case "$choice" in
    1)
        # Start Docker Compose (dev env)
        docker compose down --remove-orphans 2>/dev/null || true
        docker compose up --build
        echo -e "${GREEN}✅ Docker containers started!${NORMAL}"
        ;;
    2)
        # Install local dependencies
        if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
            cp backend/.env.example backend/.env
            echo -e "${CYAN}Copied backend/.env.example to backend/.env${NORMAL}"
        fi
        if [ -f frontend/.env.example ] && [ ! -f frontend/.env ]; then
            cp frontend/.env.example frontend/.env
            echo -e "${CYAN}Copied frontend/.env.example to frontend/.env${NORMAL}"
        fi
        echo -e "${CYAN}Installing backend dependencies...${NORMAL}"
        if [ -d "backend" ]; then
            cd backend
            if [ -f "composer.json" ]; then
                composer install --no-dev --optimize-autoloader
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Backend dependencies installed${NORMAL}"
                else
                    echo -e "${RED}❌ Failed to install backend dependencies${NORMAL}"
                    echo -e "${YELLOW}Trying to fix permissions...${NORMAL}"
                    sudo chown -R $USER:$USER .
                    composer install --no-dev --optimize-autoloader
                fi
            else
                echo -e "${RED}❌ composer.json not found in backend directory${NORMAL}"
            fi
            cd ..
        else
            echo -e "${RED}❌ Backend directory not found${NORMAL}"
        fi
        
        echo -e "${CYAN}Installing frontend dependencies...${NORMAL}"
        if [ -d "frontend" ]; then
            cd frontend
            if [ -f "package.json" ]; then
                npm install
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Frontend dependencies installed${NORMAL}"
                else
                    echo -e "${RED}❌ Failed to install frontend dependencies${NORMAL}"
                fi
            else
                echo -e "${RED}❌ package.json not found in frontend directory${NORMAL}"
            fi
            cd ..
        else
            echo -e "${RED}❌ Frontend directory not found${NORMAL}"
        fi
        echo -e "${GREEN}✅ Local dependencies installed!${NORMAL}"
        ;;
    3)
        # Stop all containers
        app_stop
        ;;
    4)
        # Clean project (stop and remove containers, volumes)
        docker compose down --timeout 10 --remove-orphans --volumes
        docker volume rm laravel-react-app_dbdata 2>/dev/null || true
        docker builder prune -f 2>/dev/null || true
        echo -e "${GREEN}✅ Project cleanup complete!${NORMAL}"
        ;;
    5)
        # View live logs
        echo -e "${CYAN}Showing live logs from all containers...${NORMAL}"
        echo -e "${YELLOW}Press Ctrl+C to exit${NORMAL}"
        docker compose logs --tail=100 -f
        ;;
    6)
        # Reset database and fresh start
        echo -e "${YELLOW}Resetting database and starting fresh...${NORMAL}"
        docker compose down --timeout 10 --remove-orphans --volumes
        docker volume rm laravel-react-app_dbdata 2>/dev/null || true
        echo -e "${CYAN}Starting containers...${NORMAL}"
        docker compose up -d
        echo -e "${CYAN}Waiting for services...${NORMAL}"
        sleep 15
        echo -e "${CYAN}Running fresh migrations and seeders...${NORMAL}"
        docker compose exec backend php artisan migrate:fresh --seed --force
        echo -e "${GREEN}✅ Fresh start complete!${NORMAL}"
        echo -e "${CYAN}Admin: admin@dev.pro / password${NORMAL}"
        echo -e "${CYAN}Showing logs...${NORMAL}"
        docker compose logs --tail=50 -f
        ;;
    *)
        echo -e "\n${RED}Invalid action number${NORMAL}\n"
        ;;
esac
