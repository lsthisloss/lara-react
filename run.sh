#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m' 
NORMAL='\033[0m'

function app_run_dev() {
    echo -e "\n${YELLOW}Starting development environment...${NORMAL}\n"
    
    # Копируем .env файлы если их нет
    if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        echo -e "${CYAN}Copied backend/.env.example to backend/.env${NORMAL}"
    fi

    if [ -f frontend/.env.example ] && [ ! -f frontend/.env ]; then
        cp frontend/.env.example frontend/.env
        echo -e "${CYAN}Copied frontend/.env.example to frontend/.env${NORMAL}"
    fi

    echo -e "${CYAN}Starting Docker containers...${NORMAL}"
    
    # Останавливаем старые контейнеры
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Собираем и запускаем
    docker compose up --build
    
    # Генерируем ключ приложения если его нет
    if ! grep -q "APP_KEY=base64:" backend/.env; then
        echo -e "${CYAN}Generating application key...${NORMAL}"
        docker compose exec backend php artisan key:generate --ansi
    fi
    
    # Показываем логи
    docker compose logs -f
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Development environment ready!${NORMAL}"
        echo -e "${CYAN}Frontend: http://localhost:3000${NORMAL}"
        echo -e "${CYAN}Backend: http://localhost:8000${NORMAL}"
        echo -e "${CYAN}Database: localhost:5432${NORMAL}"
    else
        echo -e "\n${RED}Docker startup failed${NORMAL}"
        echo -e "${CYAN}Check logs: docker compose logs${NORMAL}"
    fi
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
    docker compose up -d db
    
    # Ждем готовности базы
    echo -e "${CYAN}Waiting for database...${NORMAL}"
    sleep 10
    
    # Запускаем миграции
    docker compose exec backend php artisan migrate:fresh --seed
    
    echo -e "${GREEN}✅ Database reset complete!${NORMAL}"
}

function app_first_setup() {
    echo -e "\n${YELLOW}Setting up project for the first time...${NORMAL}\n"
    
    # Копируем .env файлы
    if [ -f backend/.env.example ] && [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        echo -e "${CYAN}✅ Copied backend/.env.example to backend/.env${NORMAL}"
    fi

    if [ -f frontend/.env.example ] && [ ! -f frontend/.env ]; then
        cp frontend/.env.example frontend/.env
        echo -e "${CYAN}✅ Copied frontend/.env.example to frontend/.env${NORMAL}"
    fi
    
    # Строим контейнеры
    echo -e "${CYAN}Building Docker containers...${NORMAL}"
    docker compose build
    
    # Запускаем в detached режиме
    echo -e "${CYAN}Starting containers...${NORMAL}"
    docker compose up -d
    
    # Генерируем ключ
    echo -e "${CYAN}Generating application key...${NORMAL}"
    docker compose exec backend php artisan key:generate --ansi
    
    # Ждем немного для инициализации
    sleep 5
    
    echo -e "\n${GREEN}✅ First setup complete!${NORMAL}"
    echo -e "${CYAN}Frontend: http://localhost:3000${NORMAL}"
    echo -e "${CYAN}Backend: http://localhost:8000${NORMAL}"
    echo -e "${CYAN}Database: localhost:5432${NORMAL}"
    echo -e "\n${YELLOW}Use ./run.sh 4 to see logs${NORMAL}"
}

function app_fix_permissions() {
    echo -e "\n${YELLOW}Fixing file permissions...${NORMAL}\n"
    
    # Get current user info
    CURRENT_USER=$(whoami)
    USER_UID=$(id -u)
    USER_GID=$(id -g)
    
    echo -e "${CYAN}Current user: ${CURRENT_USER} (${USER_UID}:${USER_GID})${NORMAL}"
    
    # Fix ownership of all project files
    echo -e "${CYAN}Fixing ownership of project files...${NORMAL}"
    sudo chown -R ${USER_UID}:${USER_GID} backend/ frontend/ 2>/dev/null || true
    
    # Make sure storage and cache directories are writable
    echo -e "${CYAN}Setting proper permissions on Laravel directories...${NORMAL}"
    chmod -R 755 backend/storage backend/bootstrap/cache 2>/dev/null || true
    
    echo -e "${GREEN}✅ File permissions fixed!${NORMAL}"
}

# Основное меню
while getopts c:t: flag; do
    case "${flag}" in
    c) choice=${OPTARG} ;;
    esac
done

if [ ! $choice ] && [ $1 ]; then
    choice=$1
fi

if [ -z $choice ]; then
    echo "  --------------------------------------------------  "
    echo "  0 - First Setup (new developers)"
    echo "  1 - Start Development (Docker)"
    echo "  2 - Install Local Dependencies"
    echo "  3 - Stop All Containers"  
    echo "  4 - Show Logs"
    echo "  5 - Clean Project (containers, volumes)"
    echo "  6 - Reset Database"
    echo "  7 - Fix File Permissions"
    echo "  --------------------------------------------------  "
    echo -e "${CYAN}Input action number > ${NORMAL}"

    read -p "" choice

    case "$choice" in
    0) app_first_setup ;;
    1) app_run_dev ;;
    2) app_setup_local ;;
    3) app_stop ;;
    4) app_logs ;;
    5) app_clean ;;
    6) app_reset_db ;;
    7) app_fix_permissions ;;
    *) echo -e "\n${RED}Invalid action number${NORMAL}\n" ;;
    esac
fi
