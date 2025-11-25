# Product Requirements Document (PRD)
## RBAC - Role-Based Access Control Backend API

---

## 1. Overview

### 1.1 Product Name
**RBAC API** - Role-Based Access Control Backend System

### 1.2 Version
1.0.0

### 1.3 Document Status
Draft | **Active** | Approved | Archived

### 1.4 Last Updated
November 25, 2025

---

## 2. Executive Summary

### 2.1 Purpose
RBAC API is a secure, scalable backend authentication and authorization system built with Node.js, Express, and MongoDB. It provides user management capabilities with role-based access control, enabling fine-grained permission management for applications.

### 2.2 Goals
- Provide secure user authentication using JWT tokens
- Implement role-based access control (RBAC) with granular permissions
- Enable user management operations (CRUD) with proper authorization
- Deliver a RESTful API that can integrate with any frontend application

### 2.3 Target Users
- **Developers**: Building applications that require authentication and authorization
- **System Administrators**: Managing user accounts and permissions
- **End Users**: Registering, logging in, and managing their profiles

---

## 3. Technical Specifications

### 3.1 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 18+ |
| Language | TypeScript | 5.x |
| Framework | Express.js | 5.x |
| Database | MongoDB | 6+ |
| ODM | Mongoose | 9.x |
| Authentication | JWT | jsonwebtoken 9.x |
| Password Hashing | bcrypt | 6.x |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
│              (Web, Mobile, Desktop, Postman)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Express Server                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Middleware                        │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐  │    │
│  │  │  CORS   │ │ Logger  │ │  Auth   │ │ Validator │  │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └───────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                      Routes                          │    │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │    │
│  │  │   Auth Routes   │    │     User Routes         │ │    │
│  │  │  /api/auth/*    │    │     /api/users/*        │ │    │
│  │  └─────────────────┘    └─────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Controllers                        │    │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │    │
│  │  │ Auth Controller │    │   User Controller       │ │    │
│  │  └─────────────────┘    └─────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                     Models                           │    │
│  │  ┌─────────────────────────────────────────────────┐│    │
│  │  │                 User Model                      ││    │
│  │  │  - Schema Definition                            ││    │
│  │  │  - Password Hashing                             ││    │
│  │  │  - Role & Permission Logic                      ││    │
│  │  └─────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        MongoDB                               │
│                    (Database Layer)                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Project Structure

```
rabc/
├── src/
│   ├── config/
│   │   └── config.ts           # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   └── user.controller.ts  # User management logic
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT & RBAC middleware
│   │   ├── corsHandler.ts      # CORS configuration
│   │   ├── loggingHandler.ts   # Request logging
│   │   └── routeNotFound.ts    # 404 handler
│   ├── models/
│   │   └── user.model.ts       # User schema & methods
│   ├── routes/
│   │   ├── auth.routes.ts      # Auth endpoints
│   │   └── user.routes.ts      # User endpoints
│   ├── utils/
│   │   └── logging.ts          # Logging utility
│   └── server.ts               # Application entry point
├── docs/
│   └── PRD.md                  # This document
├── .env                        # Environment variables
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

---

## 4. Functional Requirements

### 4.1 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **User** | Standard user | Own profile only |
| **Moderator** | Elevated user | Read access to all users |
| **Admin** | Full access | Complete CRUD on all users |

### 4.2 Permissions Matrix

| Permission | User | Moderator | Admin |
|------------|:----:|:---------:|:-----:|
| `read:own_profile` | ✅ | ✅ | ✅ |
| `write:own_profile` | ✅ | ✅ | ✅ |
| `read:users` | ❌ | ✅ | ✅ |
| `write:users` | ❌ | ❌ | ✅ |
| `delete:users` | ❌ | ❌ | ✅ |

### 4.3 API Endpoints

#### 4.3.1 Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-------------:|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | User login |
| `GET` | `/api/auth/profile` | ✅ | Get current user profile |
| `PUT` | `/api/auth/profile` | ✅ | Update current user profile |
| `PUT` | `/api/auth/change-password` | ✅ | Change password |

#### 4.3.2 User Management Endpoints

| Method | Endpoint | Auth | Role Required | Description |
|--------|----------|:----:|:-------------:|-------------|
| `GET` | `/api/users` | ✅ | Moderator+ | List all users |
| `GET` | `/api/users/:id` | ✅ | Moderator+ | Get user by ID |
| `PUT` | `/api/users/:id` | ✅ | Admin | Update user |
| `DELETE` | `/api/users/:id` | ✅ | Admin | Delete user |
| `PATCH` | `/api/users/:id/role` | ✅ | Admin | Change user role |
| `PATCH` | `/api/users/:id/activate` | ✅ | Admin | Activate user |
| `PATCH` | `/api/users/:id/deactivate` | ✅ | Admin | Deactivate user |

#### 4.3.3 Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API welcome message |
| `GET` | `/health` | Health check endpoint |

---

## 5. Data Models

### 5.1 User Model

```typescript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  email: String,           // Unique, required, validated
  password: String,        // Hashed with bcrypt, not returned by default
  firstName: String,       // Required, max 50 chars
  lastName: String,        // Required, max 50 chars
  role: Enum,              // 'user' | 'moderator' | 'admin'
  isActive: Boolean,       // Account status, default: true
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-updated timestamp
}
```

### 5.2 JWT Payload

```typescript
{
  id: String,              // User ID
  email: String,           // User email
  role: String,            // User role
  iat: Number,             // Issued at timestamp
  exp: Number              // Expiration timestamp
}
```

---

## 6. API Request/Response Examples

### 6.1 Register User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "674123abc456def789012345",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6.2 Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "674123abc456def789012345",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6.3 Get All Users (Admin)

**Request:**
```http
GET /api/users?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "674123abc456def789012345",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "isActive": true,
        "createdAt": "2025-11-25T10:00:00.000Z",
        "updatedAt": "2025-11-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 6.4 Error Response

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Authentication failed"
}
```

---

## 7. Security Requirements

### 7.1 Authentication
- [x] JWT-based stateless authentication
- [x] Token expiration (7 days default)
- [x] Bearer token in Authorization header

### 7.2 Password Security
- [x] Bcrypt hashing with salt rounds (10)
- [x] Minimum password length (6 characters)
- [x] Password not returned in API responses

### 7.3 Authorization
- [x] Role-based access control (RBAC)
- [x] Permission-based middleware
- [x] Route-level protection

### 7.4 Data Protection
- [x] Input validation on all endpoints
- [x] Email format validation
- [x] MongoDB injection prevention via Mongoose
- [x] CORS configuration

---

## 8. Environment Configuration

### 8.1 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `SERVER_PORT` | Server port | `5000` |
| `SERVER_HOSTNAME` | Server hostname | `localhost` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/rabc` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |

### 8.2 Sample .env File

```env
NODE_ENV=development
SERVER_HOSTNAME=localhost
SERVER_PORT=5000
MONGO_URI=mongodb://localhost:27017/rabc
JWT_SECRET=yourSuperSecretJWTSecretKey
```

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Response time < 200ms for standard operations
- Support for pagination on list endpoints
- Efficient database indexing on email field

### 9.2 Scalability
- Stateless architecture (horizontal scaling ready)
- MongoDB replica set compatible
- Environment-based configuration

### 9.3 Reliability
- Graceful shutdown handling
- Uncaught exception handling
- Unhandled promise rejection handling
- Health check endpoint for monitoring

### 9.4 Logging
- Request/response logging with timestamps
- Error logging with stack traces (development)
- Configurable log levels

---

## 10. Future Enhancements (Roadmap)

### Phase 2 - Q1 2026
- [ ] Refresh token implementation
- [ ] Password reset via email
- [ ] Email verification on registration
- [ ] Rate limiting

### Phase 3 - Q2 2026
- [ ] OAuth 2.0 integration (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Session management
- [ ] Audit logging

### Phase 4 - Q3 2026
- [ ] API versioning
- [ ] OpenAPI/Swagger documentation
- [ ] Automated testing suite
- [ ] Docker containerization

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 200ms | Average latency |
| Uptime | 99.9% | Monthly availability |
| Error Rate | < 0.1% | Failed requests / total |
| Test Coverage | > 80% | Unit + Integration tests |

---

## 12. Appendix

### 12.1 HTTP Status Codes Used

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (registration) |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server errors |

### 12.2 Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

---

## 13. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-25 | Development Team | Initial PRD |

---

*End of Document*
