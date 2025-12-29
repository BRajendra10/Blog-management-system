# 🚀 Backend API – User & Blog Service

A **production-ready REST API backend** built with **Node.js, Express, MongoDB, JWT authentication, ImageKit, and Multer**.

This project implements **secure user authentication**, **avatar & image uploads**, and **blog CRUD with ownership protection**, following real-world backend best practices.

---

## 🧩 Features

### 👤 User Authentication

* User registration with **avatar upload (ImageKit)**
* Secure login with **JWT (Access + Refresh Tokens)**
* Tokens stored in **httpOnly cookies**
* Password hashing using **bcrypt**
* Refresh token persistence in database

### 📝 Blog Management

* Create, Read, Update, Delete blogs
* Blog thumbnail upload using **ImageKit**
* Only blog owner can update or delete their blog
* Public blog reading
* Automatic cleanup of images on update/delete

### 🛡️ Security & Architecture

* Centralized error handling (`ApiError`)
* Async error wrapper (`asyncHandler`)
* JWT-based route protection
* Clean MVC folder structure
* RESTful API design

---

## 🏗️ Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **JWT (jsonwebtoken)**
* **bcrypt**
* **ImageKit** (media storage)
* **Multer** (file uploads)
* **CORS**

---

## 📁 Project Structure

```
src/
│
├── controllers/
│   ├── user.controller.js
│   └── blog.controller.js
│
├── models/
│   ├── user.model.js
│   └── blog.model.js
│
├── routes/
│   ├── user.route.js
│   └── blog.route.js
│
├── middleware/
│   ├── auth.middleware.js
│   └── multer.middleware.js
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── imagekit.js
│
├── db/
│   └── index.js
│
└── server.js
```

---

## 🔐 Authentication Flow

1. User registers with avatar
2. Avatar uploaded to ImageKit
3. Password hashed & user stored
4. On login:

   * Access Token (15 min)
   * Refresh Token (15 days)
   * Tokens stored in **httpOnly cookies**
5. Protected routes validate JWT via cookies

---

## 🌐 API Endpoints

### 👤 User Routes

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| POST   | `/api/v1/users/register` | Register new user with avatar |
| POST   | `/api/v1/users/login`    | Login user                    |

---

### 📝 Blog Routes

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| GET    | `/api/v1/blog`         | Get all blogs               |
| POST   | `/api/v1/blog/create`  | Create blog (auth required) |
| GET    | `/api/v1/blog/:blogId` | Get blog by ID              |
| PATCH  | `/api/v1/blog/:blogId` | Update blog (owner only)    |
| DELETE | `/api/v1/blog/:blogId` | Delete blog (owner only)    |

---

## 🧪 Environment Variables

Create a `.env` file in root:

```
PORT=8000
MONGODB_URI=your_mongodb_url

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=15d

PUBLIC_KEY=your_imagekit_public_key
PRIVATE_KEY=your_imagekit_private_key
URL_ENDPOINT=your_imagekit_url

CORS_ORIGIN=http://localhost:3000
```

---

## ▶️ Running the Project

```bash
npm install
npm run dev
```

Server will start at:

```
http://localhost:8000
```

---

## 🧠 Best Practices Followed

* ❌ No tokens exposed to frontend JS
* ✅ Image cleanup on failure
* ✅ Ownership checks at controller level
* ✅ REST-compliant routes
* ✅ Centralized error handling

---

## 🚀 Future Enhancements

* Logout endpoint
* Refresh access token endpoint
* Rate limiting
* Email verification
* Blog likes & comments
* Pagination & search

---

## 👨‍💻 Author

**Rajendra Behera**
Front-End → Full-Stack Developer

* GitHub: [https://github.com/BRajendra10](https://github.com/BRajendra10)
* LinkedIn: [https://www.linkedin.com/in/behera-rajendra/](https://www.linkedin.com/in/behera-rajendra/)

---

> This backend is designed to reflect **real-world production patterns**, not tutorial-level code.
