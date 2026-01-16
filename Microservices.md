# BFF Architecture

city-ventures/
├── apps/
│   ├── tourism-management/
│   │   ├── src/
│   │   └── package.json
│   └── business-portal/
│   │   ├── src/
│   │   └── package.json
│   └── mobile-app/
│       ├── src/
│       └── package.json
│
├── services/
│   ├── business-portal-backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── client/
│   │   └── package.json
│   │
│   ├── tourism-management-backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   └── package.json
│   │
│   ├── mobile-app-backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   └── package.json
│   │
│   └── core-api/
│       ├── src/
│       │   ├── config/                 # Database & Env config
│       │   ├── database/               # Migrations, Seeds, Procedures
│       │   ├── modules/
│       │   │   ├── auth/               # Contains controller, service, route for Auth
│       │   │   ├── ordering/
│       │   │   ├── booking/
│       │   │   └── tourism/
│       │   └── middlewares/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── ui-components/
│   └── types/
│
├── docker-compose.yml
├── package.json
└── README.md
