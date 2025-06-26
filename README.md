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
- **🐳 Docker Setup** - One-command development

---

## 🚀 Quick Start

```bash
git clone https://github.com/lsthisloss/lara-react.git
cd laravel-react-app
chmod +x run.sh && ./run.sh
# Select 0 for first setup, 1 for daily dev
```

**Access:** Frontend: http://localhost:3000 | API: http://localhost:8000/api

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
Email: admin@example.com
Password: password
```

**Use Cases:**
1. **Store Management** - Create, edit, delete posts
2. **User Administration** - Toggle admin status
3. **Content Moderation** - Review and manage content
4. **System Analytics** - Monitor dashboard statistics

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Ant Design |
| **Backend** | Laravel 11 + Sanctum Auth |
| **Database** | PostgreSQL |
| **DevOps** | Docker Compose |

---

## 🎨 Demo Screenshots

<details>
<summary><strong>Admin Dashboard</strong></summary>

![Admin Dashboard](https://github.com/user-attachments/assets/fb2d48c7-0414-44af-81d6-b26a1579f179)

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

Built with ❤️ for modern web development
Development Timeline 9h

