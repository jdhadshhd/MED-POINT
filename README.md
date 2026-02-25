# Smart MediPoint

A comprehensive medical practice management system built with Node.js, Express, EJS, and SQLite.

## Features

- **Role-Based Access Control**: Admin, Doctor, and Patient portals
- **Real-Time Notifications**: Socket.io powered notifications
- **Appointment Management**: Schedule and manage patient appointments
- **Medical Records**: Create and view medical records with file uploads
- **Support Tickets**: Integrated support ticket system
- **Secure Authentication**: JWT-based authentication with httpOnly cookies

## Tech Stack

- **Backend**: Node.js + Express 5
- **Templating**: EJS with express-ejs-layouts
- **Database**: SQLite via Prisma ORM
- **Real-Time**: Socket.io
- **Security**: helmet, bcrypt, express-rate-limit
- **File Uploads**: Multer

## Quick Start

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Seed the database with test users
npm run prisma:seed

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

## Default Login Credentials

| Role    | Email                   | Password   |
|---------|-------------------------|------------|
| Admin   | admin@medipoint.com     | admin123   |
| Doctor  | doctor@medipoint.com    | doctor123  |
| Patient | patient@medipoint.com   | patient123 |

## Project Structure

```
src/
├── config/                 # Configuration files
│   ├── env.js             # Environment config
│   └── socket.js          # Socket.io setup
├── domains/               # Domain modules (modular monolith)
│   ├── admin/             # Admin portal
│   │   ├── admin.controller.js
│   │   ├── admin.repo.js
│   │   ├── admin.routes.js
│   │   ├── admin.service.js
│   │   └── views/
│   ├── appointments/      # Appointment management
│   ├── auth/              # Authentication
│   ├── doctor/            # Doctor portal
│   ├── notifications/     # Real-time notifications
│   ├── patient/           # Patient portal
│   ├── shared/            # Shared views & components
│   ├── site/              # Public landing pages
│   └── tickets/           # Support tickets
├── middleware/            # Express middleware
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   ├── requireAuth.js
│   └── requireRole.js
├── app.js                # Express app setup
├── prisma.js             # Prisma client singleton
└── server.js             # HTTP server + Socket.io

prisma/
├── schema.prisma         # Database schema
├── seed.js               # Database seeder
└── migrations/           # Database migrations

public/
└── site/
    ├── css/global.css    # Global styles
    └── js/global.js      # Client-side JS + Socket.io
```

## API Routes

### Public
- `GET /` - Landing page
- `GET /auth/login` - Login page
- `GET /auth/register` - Registration page
- `POST /auth/login` - Login action
- `POST /auth/register` - Registration action
- `POST /auth/logout` - Logout

### Admin Portal (`/admin`)
- `GET /admin` - Dashboard
- `GET /admin/users` - User management
- `GET /admin/reports` - Reports
- `GET /admin/support` - Support tickets
- `GET /admin/support/:id` - Ticket detail
- `POST /admin/support/:id/reply` - Reply to ticket
- `GET /admin/settings` - Settings

### Doctor Portal (`/doctor`)
- `GET /doctor` - Dashboard
- `GET /doctor/patients` - Patient list
- `GET /doctor/appointments` - Appointments
- `PATCH /doctor/appointments/:id/status` - Update appointment status
- `GET /doctor/records` - Medical records
- `POST /doctor/records` - Create medical record

### Patient Portal (`/patient`)
- `GET /patient` - Dashboard
- `GET /patient/appointments` - My appointments
- `POST /patient/appointments` - Book appointment
- `DELETE /patient/appointments/:id` - Cancel appointment
- `GET /patient/records` - My medical records
- `GET /patient/profile` - Profile
- `POST /patient/upload` - Upload documents

### Notifications
- `GET /notifications` - All notifications
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL="file:./dev.db"
COOKIE_SECURE=false
UPLOAD_DIR=uploads
```

## Scripts

- `npm run dev` - Start with nodemon (hot reload)
- `npm start` - Start production server
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database

## Security Features

- **Rate Limiting**: Auth routes (10 req/15min), Upload routes (20 req/hr)
- **Helmet**: Security headers
- **JWT**: httpOnly cookies with 7-day expiry
- **Password Hashing**: bcrypt with salt rounds

## License

MIT
