# 📌 BoxPlay - Ground Booking System

**BoxPlay** is a **ground booking system** where users can book and manage ground slots for sports activities inside the nets.

## 📋 Table of Contents
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Usage](#-usage)
- [Contributors](#-contributors)

---

## 🚀 Features

- **User Registration & Authentication** (Email verification, OTP, password reset)
- **Ground Booking Management** (View available slots, book, cancel, feedback)
- **Shop & Sports Management** (Add, update, and manage sports facilities)
- **Revenue Tracking** (Track shop revenue and transactions)
- **Admin & User Roles** (Admins can verify shops, manage bookings)

---

## 🛠 Installation

### 📌 Prerequisites

- **Node.js** (Latest LTS Version)
- **MongoDB** (Database for storing user, shop, and booking data)

### 📌 Setup Instructions

1. **Clone the Repository**
   ```sh
   git clone https://github.com/RamDheeraj6124/BoxPlay.git
   cd boxplay
   ```

2. **Frontend Setup**
   ```sh
   cd fedproject/my-react-app
   npm install
   npm start
   ```

3. **Backend Setup**
   ```sh
   cd fedproject/backend
   npm install
   nodemon
   ```

---

## 📂 Project Structure

```sh
boxplay/
│── fedproject/
│   ├── my-react-app/   # Frontend React application
│   ├── backend/        # Backend API (Node.js + Express)
│── models/             # MongoDB Models
│── routes/             # Express API Routes
│── controllers/        # Business logic for handling requests
│── services/           # Core domain services (DDD)
│── repositories/       # Data access layer for MongoDB
│── config/             # Configuration files
│── README.md           # Documentation
```

---

## 📌 API Endpoints

### **User APIs**
| Method | Endpoint         | Description |
|--------|-----------------|-------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login` | Login user |
| GET    | `/api/user/profile` | Get user profile |

### **Booking APIs**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/booking/available` | Get available slots |
| POST   | `/api/booking/create` | Book a ground slot |
| DELETE | `/api/booking/cancel/:id` | Cancel booking |

---

## 🚀 Usage

1. **Sign Up/Login** to the system.
2. **Browse** available grounds and sports.
3. **Book a Slot** for your preferred time.
4. **Provide Feedback** after playing.
5. **Admin Role**: Manage shops, bookings, and revenue.

---

## 👨‍💻 Contributors

**Group ID:** 38  
**Project Members:**
- K. Chandrasekhar (S20220010119)
- K. Ram Dheeraj (S20220010120)
- M. Sai Rohith (S20220010130)
- O. Uday Kiran (S20220010155)
- P. Jaswanth (S20220010168)

---
