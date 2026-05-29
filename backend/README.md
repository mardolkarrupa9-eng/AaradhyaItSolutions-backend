# Aaradhya IT Solutions — Backend API

Express.js REST API for Aaradhya IT Solutions website.

## Tech Stack
- Node.js + Express.js
- JWT Authentication
- Nodemon (dev)

## Folder Structure
backend/
├── src/
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── authController.js
│   │   │   ├── productsController.js
│   │   │   ├── inquiriesController.js
│   │   │   └── dashboardController.js
│   │   └── public/
│   │       ├── productsController.js
│   │       ├── inquiriesController.js
│   │       └── statsController.js
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── authRoutes.js
│   │   │   ├── productsRoutes.js
│   │   │   ├── inquiriesRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   └── public/
│   │       ├── productsRoutes.js
│   │       ├── inquiriesRoutes.js
│   │       └── statsRoutes.js
│   ├── data/
│   │   ├── products.js
│   │   ├── reviews.js
│   │   └── inquiries.js
│   └── middleware/
│       └── auth.js
├── server.js
├── package.json
└── .env

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Create .env file
PORT=5000
JWT_SECRET=aaradhya_it_solutions_secret_key_2024
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

### 3. Run development server
```bash
npm run dev
```

### 4. Run production server
```bash
npm start
```

## API Endpoints

### Public APIs (no auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/public/products | Get all products |
| GET | /api/public/products/:id | Get single product |
| GET | /api/public/stats | Get home page stats |
| POST | /api/public/inquiries | Submit contact form |

### Admin APIs (JWT token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/auth/login | Admin login |
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/products | Get all products |
| POST | /api/admin/products | Add product |
| DELETE | /api/admin/products/:id | Delete product |
| DELETE | /api/admin/products/bulk | Delete multiple |
| GET | /api/admin/inquiries | Get all inquiries |
| PATCH | /api/admin/inquiries/:id/status | Update status |

## Authentication
Admin routes require JWT token in header:
Authorization: Bearer <token>
Get token by calling POST /api/admin/auth/login

## Deployment
Deployed on Render.com
- Auto deploys on push to main branch
- Environment variables set in Render dashboard