# 🚀 Laravel + React SPA

<div align="center">

**Modern full-stack application with admin panel**

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## 🎯 Features

- **🔐 Sanctum SPA Auth** - CSRF protected sessions  
- **📝 Posts CRUD** - Full content management
- **👑 Admin Panel** - User & content moderation
- **📱 Mobile Responsive** - Touch-friendly UI for all devices
- **🏪 Content Store** - Digital content marketplace with CRUD
- **⚡ MobX State** - Atomic transactions with runInAction
- **🐳 Docker Setup** - One-command development

---

## 🚀 Quick Start

```bash
git clone https://github.com/lsthisloss/lara-react.git
cd laravel-react-app
chmod +x run.sh && ./run.sh
# Select 0 for first setup, 1 for daily dev
```

<details>
  
  <summary>
<Strong>Первый сетап считается успешно запущенным если вы увидели вывод такого типа:</Strong>
  </summary>
  
```bash
[+] Building 2/2
 ✔ frontend  Built                                                                                                                                                                                     0.0s 
 ✔ backend   Built                                                                                                                                                                                     0.0s 
Starting containers...
[+] Running 6/6
 ✔ Network laravel-react-app_app-network  Created                                                                                                                                                      0.0s 
 ✔ Volume "laravel-react-app_dbdata"      Created                                                                                                                                                      0.0s 
 ✔ Container laravel-db                   Healthy                                                                                                                                                      9.1s 
 ✔ Container laravel-backend              Healthy                                                                                                                                                     14.7s 
 ✔ Container laravel-nginx                Started                                                                                                                                                      9.4s 
 ✔ Container react-frontend               Started                                                                                                                                                     14.9s 
Generating application key...

   INFO  Application key set successfully.  


✅ First setup complete!
Frontend: http://localhost:3000
Backend: http://localhost:8000
Database: localhost:5432
```

</details>

---

## 📊 API Endpoints

**Auth:**
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/logout` - User logout

**Posts:**
- `GET /api/posts` - List posts (with pagination)
- `POST /api/posts` - Create post
- `GET /api/posts/{id}` - Get post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

**Admin:**
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - User management
- `PATCH /api/admin/users/{id}/toggle-admin` - Toggle admin status

---

## 👑 Admin Access

```
Email: admin@dev.pro
Password: password
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + MobX + TypeScript + Ant Design |
| **Backend** | Laravel 11 + Sanctum Auth |
| **Database** | PostgreSQL |
| **DevOps** | Docker Compose |
| **Mobile** | Responsive Design + Touch UI |

---

## 📱 Mobile Responsive

- **📱 Mobile-First Design** - Optimized for all screen sizes
- **🎯 Touch-Friendly UI** - Ant Design responsive components
- **📊 Adaptive Tables** - Horizontal scroll on mobile devices
- **🔧 Modal Optimization** - Dynamic sizing for small screens
- **⚡ Fast Performance** - Optimized for mobile networks
- **🔄 MobX Reactivity** - Atomic state updates with runInAction for smooth UI

---

## 🎨 Demo Screenshots

<details>
<summary><strong>Admin Dashboard</strong></summary>

![Screenshot 2025-06-26 201116](https://github.com/user-attachments/assets/e4074886-c163-4d22-af34-2b3c2fbd4e7a)

</details>

<details>
<summary><strong>Posts Management</strong></summary>

![Posts Page](https://github.com/user-attachments/assets/cc20187d-1a84-4a2c-a1f7-e3d9264e288f)

</details>

<details>
<summary><strong>User Profile</strong></summary>

![User Page](https://github.com/user-attachments/assets/1a752948-7c64-49f1-8f82-b32402d36d76)

</details>

---

Built with ❤️ by **sk8** for modern web development    
Development Timeline 9h

