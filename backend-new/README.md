# CityVenture Backend (New)

A modernized backend for the CityVenture tourism platform built with **Express.js** and **Sequelize ORM**.

## 🚀 Features

- **Sequelize ORM** - Type-safe database operations with model associations
- **JWT Authentication** - Access/refresh token pattern with HttpOnly cookies
- **Role-Based Access Control** - Permission-based authorization
- **Stored Procedures** - Complex database operations via procedures
- **Input Validation** - Request validation using Joi schemas
- **Security Hardened** - Helmet, HPP, XSS protection, rate limiting
- **API Versioning** - `/api/v1/` routes for future compatibility
- **Structured Logging** - Winston logger with file transports
- **Graceful Shutdown** - Clean database connection handling

## 📁 Project Structure

```
backend-new/
├── src/
│   ├── config/            # Configuration files
│   │   ├── config.js      # Environment configuration
│   │   ├── database.js    # Sequelize connection
│   │   ├── logger.js      # Winston logger setup
│   │   └── sequelize.cjs  # Sequelize CLI config
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Express middleware
│   │   ├── authenticate.js    # JWT verification
│   │   ├── authorize.js       # RBAC middleware
│   │   ├── error-handler.js   # Error handling
│   │   ├── rate-limiter.js    # Rate limiting
│   │   ├── security.js        # Security headers
│   │   └── validate-request.js # Joi validation
│   ├── migrations/        # Sequelize migrations
│   ├── models/            # Sequelize models
│   ├── procedures/        # Stored procedure definitions
│   ├── routes/            # API routes
│   │   ├── health.route.js
│   │   └── v1/            # API v1 routes
│   ├── scripts/           # Database management scripts
│   ├── seeders/           # Database seeders
│   ├── services/          # Business logic layer
│   ├── utils/             # Utility functions
│   ├── validations/       # Joi validation schemas
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── tests/                 # Test files
│   ├── integration/       # Integration tests
│   └── unit/              # Unit tests
├── .env.example           # Environment template
├── package.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MySQL 8.0+ or MariaDB 10.5+
- npm or yarn

### Installation

1. **Clone and navigate to the new backend**
   ```bash
   cd backend-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   # Run migrations
   npm run db:migrate

   # Create stored procedures
   npm run db:procedures

   # Seed initial data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with watch |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:seed` | Run all seeders |
| `npm run db:seed:undo` | Undo all seeders |
| `npm run db:procedures` | Create stored procedures |
| `npm run db:setup` | Full database setup |
| `npm run db:reset` | Reset database (drop + migrate + seed) |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |

## 🔒 Security Features

- **Helmet** - Secure HTTP headers
- **HPP** - HTTP Parameter Pollution prevention
- **XSS-clean** - Cross-site scripting protection
- **Rate Limiting** - Request throttling
- **bcrypt** - Password hashing (12 rounds)
- **JWT** - Algorithm pinning (HS256)
- **Account Lockout** - 5 failed attempts = 15min lock

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `UserRole` | User roles with permissions |
| `User` | User accounts and auth |
| `Owner` | Business owner profiles |
| `Tourist` | Tourist profiles |
| `Business` | Business listings |
| `Room` | Accommodation rooms |
| `Booking` | Room reservations |
| `Payment` | Transaction records |
| `Amenity` | Available amenities |

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Users (Admin only)
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Businesses
- `GET /api/v1/businesses` - List businesses
- `GET /api/v1/businesses/:id` - Get business
- `POST /api/v1/businesses` - Create business
- `PATCH /api/v1/businesses/:id` - Update business
- `DELETE /api/v1/businesses/:id` - Delete business

### Bookings
- `GET /api/v1/bookings` - List bookings
- `GET /api/v1/bookings/:id` - Get booking
- `POST /api/v1/bookings` - Create booking
- `PATCH /api/v1/bookings/:id` - Update booking
- `POST /api/v1/bookings/:id/cancel` - Cancel booking
- `POST /api/v1/bookings/:id/check-in` - Check in guest
- `POST /api/v1/bookings/:id/check-out` - Check out guest

### Health
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check with DB status

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Business Owner | `owner@cityventure.test` | `Owner123!` |
| Tourist | `tourist@cityventure.test` | `Tourist123!` |
| Tourism Admin | `admin@cityventure.test` | `Admin123!` |

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |
| `JWT_ACCESS_SECRET` | Access token secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_ACCESS_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |

## 🔄 Migration from Knex

This backend replaces the previous Knex-based implementation with Sequelize:

| Knex Pattern | Sequelize Equivalent |
|--------------|---------------------|
| `knex('table').select()` | `Model.findAll()` |
| `knex('table').where({})` | `Model.findOne({ where: {} })` |
| `knex('table').insert()` | `Model.create()` |
| `knex.raw('CALL Procedure(?)')` | `sequelize.query('CALL Procedure(?)')` |

## 📚 Additional Documentation

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [JWT.io](https://jwt.io/)

## 📄 License

This project is part of the CityVenture Capstone Project.
