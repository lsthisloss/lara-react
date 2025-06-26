# Laravel + React SPA

Full-stack application with Laravel backend and React frontend.

## Stack

- **Backend:** Laravel 12 + Sanctum + PostgreSQL
- **Frontend:** React 19 + TypeScript + Vite  
- **Containerization:** Docker + Docker Compose

## Quick Start

```bash
# Clone repository
git clone https://github.com/lsthisloss/lara-react.git
cd laravel-react-app
chmod +x run.sh
#Enter 0 to run First Setup (copies .env files, builds containers)



## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api  
- Backend Web: http://localhost:8000
- Database: localhost:5432

## Features

- 🔐 Sanctum SPA authentication (CSRF protection)
- 📝 Posts CRUD operations
- 🐘 PostgreSQL database with seeders
- 🐳 Docker containerized development
- 🔧 Fixed permission issues for team development

## API Testing

Use included Postman collection (`backend/postman_collection.json`):
1. Import collection to Postman
2. Test registration/login endpoints  
3. Test posts CRUD operations
4. Auth tokens are auto-managed

## Environment

Environment files are automatically copied from `.env.example` on first run.
All necessary configuration for Docker development is pre-configured.

---

**Note:** Run `./run.sh 0` for first setup, then use `./run.sh 1` for daily development.
