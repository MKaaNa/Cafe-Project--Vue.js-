

# ☕ Cafe Management Application

A fullstack **Cafe Management Web Application** built with **Vue.js** on the frontend and a backend API.
Customers can browse the menu and place orders, while administrators manage menu items and track orders.

---

## 🚀 Features

* 🔐 **Authentication** (register & login with JWT)
* 📋 **Menu browsing** with categories and products
* 🛒 **Cart & order placement**
* 📦 **Order management** (pending → in-progress → completed)
* 🧑‍🍳 **Admin dashboard** for menu & orders
* 📱 **Responsive UI** with Vue.js

---

## 🛠 Tech Stack

* **Frontend:** Vue.js, Vue Router, Vuex, Bootstrap/Tailwind
* **Backend:** REST API (Node.js/Express or Spring Boot depending on setup)
* **Database:** PostgreSQL / MySQL / MongoDB (based on backend)
* **Authentication:** JWT

---

## 📂 Project Structure

```
cafe-app/
├── frontend/       # Vue.js app (components, views, store)
├── backend/        # Backend API (auth, menu, orders)
└── README.md
```

---

## ⚙️ Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/MKaaNa/cafe-app.git
cd cafe-app
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run serve
```

👉 Runs at: `http://localhost:8080`

### 3️⃣ Backend Setup

Go to `backend/` and configure your database connection in `.env` (Node.js) or `application.yml` (Spring Boot).

**Example `.env`:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafe
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=change-me
```

Run backend:

```bash
npm run start        # for Node.js/Express
# or
./mvnw spring-boot:run   # for Spring Boot
```

---

## ▶️ Usage

1. **Register / Login** as a customer.
2. **Browse menu items** and add them to cart.
3. **Place orders** and track order status.
4. **Check order history** in profile.
5. **Admin role:** create/edit/delete menu items, manage orders.

---

## 📄 License

MIT License

---

## ✍️ Author

Developed by **[MKaaNa](https://github.com/MKaaNa)**

---
