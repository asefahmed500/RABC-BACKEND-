# Postman API Testing Guide
## RBAC Backend API - Complete Testing Documentation

---

## 📋 Table of Contents
1. [Setup Instructions](#1-setup-instructions)
2. [Environment Variables](#2-environment-variables)
3. [Authentication APIs](#3-authentication-apis)
4. [User Management APIs](#4-user-management-apis)
5. [Utility APIs](#5-utility-apis)
6. [Error Responses](#6-error-responses)
7. [Testing Flow](#7-testing-flow)

---

## 1. Setup Instructions

### 1.1 Prerequisites
- Postman installed ([Download here](https://www.postman.com/downloads/))
- Server running on `http://localhost:5000`
- MongoDB running locally

### 1.2 Create Postman Environment

1. Click **Environments** → **Create Environment**
2. Name it: `RBAC Local`
3. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` |
| `token` | (leave empty) | (auto-filled after login) |
| `user_id` | (leave empty) | (auto-filled after register) |

### 1.3 Set Authorization Header (Global)

For protected routes, add this header:
```
Authorization: Bearer {{token}}
```

---

## 2. Environment Variables

Create these in Postman for easy testing:

```
base_url = http://localhost:5000
token = (your JWT token after login)
user_id = (user ID for testing)
admin_token = (admin JWT token)
```

---

## 3. Authentication APIs

### 3.1 Register User

Creates a new user account.

#### Request
```
POST {{base_url}}/api/auth/register
```

#### Headers
```
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
}
```

#### Success Response (201 Created)
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGFiYzEyM2RlZjQ1Njc4OTAxMjM0NSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMyNTIwMDAwLCJleHAiOjE3MzMxMjQ4MDB9.xxxxx"
    }
}
```

#### Error Responses

**Missing Fields (400)**
```json
{
    "success": false,
    "message": "Please provide all required fields: email, password, firstName, lastName"
}
```

**Email Already Exists (400)**
```json
{
    "success": false,
    "message": "User with this email already exists"
}
```

**Invalid Email Format (500)**
```json
{
    "success": false,
    "message": "Error registering user",
    "error": "User validation failed: email: Please provide a valid email"
}
```

#### Postman Test Script (Auto-save token)
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("user_id", jsonData.data.user.id);
}
```

---

### 3.2 Register Admin User

Register a user with admin role (for testing admin features).

#### Request
```
POST {{base_url}}/api/auth/register
```

#### Headers
```
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
}
```

#### Success Response (201 Created)
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "674abc123def456789012346",
            "email": "admin@example.com",
            "firstName": "Admin",
            "lastName": "User",
            "role": "admin"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

#### Postman Test Script (Save admin token)
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.data.token);
}
```

---

### 3.3 Register Moderator User

#### Request
```
POST {{base_url}}/api/auth/register
```

#### Body (raw JSON)
```json
{
    "email": "moderator@example.com",
    "password": "mod123",
    "firstName": "Mod",
    "lastName": "User",
    "role": "moderator"
}
```

#### Success Response (201 Created)
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "674abc123def456789012347",
            "email": "moderator@example.com",
            "firstName": "Mod",
            "lastName": "User",
            "role": "moderator"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

---

### 3.4 Login

Authenticate user and receive JWT token.

#### Request
```
POST {{base_url}}/api/auth/login
```

#### Headers
```
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGFiYzEyM2RlZjQ1Njc4OTAxMjM0NSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzMyNTIwMDAwLCJleHAiOjE3MzMxMjQ4MDB9.xxxxx"
    }
}
```

#### Error Responses

**Missing Credentials (400)**
```json
{
    "success": false,
    "message": "Please provide email and password"
}
```

**Invalid Credentials (401)**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

**Deactivated Account (401)**
```json
{
    "success": false,
    "message": "Your account has been deactivated. Please contact support."
}
```

#### Postman Test Script
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("user_id", jsonData.data.user.id);
}
```

---

### 3.5 Get Profile

Get current authenticated user's profile.

#### Request
```
GET {{base_url}}/api/auth/profile
```

#### Headers
```
Authorization: Bearer {{token}}
```

#### Body
```
None
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user",
            "isActive": true,
            "createdAt": "2025-11-25T10:00:00.000Z",
            "updatedAt": "2025-11-25T10:00:00.000Z"
        }
    }
}
```

#### Error Responses

**No Token (401)**
```json
{
    "success": false,
    "message": "Access denied. No token provided."
}
```

**Invalid Token (401)**
```json
{
    "success": false,
    "message": "Invalid token."
}
```

---

### 3.6 Update Profile

Update current user's profile information.

#### Request
```
PUT {{base_url}}/api/auth/profile
```

#### Headers
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "firstName": "Johnny",
    "lastName": "Updated"
}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "user": {
            "id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "Johnny",
            "lastName": "Updated",
            "role": "user"
        }
    }
}
```

#### Update Email Example
```json
{
    "email": "newemail@example.com"
}
```

---

### 3.7 Change Password

Change the authenticated user's password.

#### Request
```
PUT {{base_url}}/api/auth/change-password
```

#### Headers
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "currentPassword": "password123",
    "newPassword": "newPassword456"
}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

#### Error Responses

**Missing Fields (400)**
```json
{
    "success": false,
    "message": "Please provide current password and new password"
}
```

**Password Too Short (400)**
```json
{
    "success": false,
    "message": "New password must be at least 6 characters"
}
```

**Wrong Current Password (401)**
```json
{
    "success": false,
    "message": "Current password is incorrect"
}
```

---

## 4. User Management APIs

> ⚠️ **Note:** These endpoints require Admin or Moderator role. Use `{{admin_token}}` in Authorization header.

---

### 4.1 Get All Users

Get paginated list of all users (Admin/Moderator only).

#### Request
```
GET {{base_url}}/api/users
```

#### Headers
```
Authorization: Bearer {{admin_token}}
```

#### Query Parameters (Optional)
```
?page=1&limit=10
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "_id": "674abc123def456789012345",
                "email": "john@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "role": "user",
                "isActive": true,
                "createdAt": "2025-11-25T10:00:00.000Z",
                "updatedAt": "2025-11-25T10:00:00.000Z"
            },
            {
                "_id": "674abc123def456789012346",
                "email": "admin@example.com",
                "firstName": "Admin",
                "lastName": "User",
                "role": "admin",
                "isActive": true,
                "createdAt": "2025-11-25T10:05:00.000Z",
                "updatedAt": "2025-11-25T10:05:00.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 2,
            "pages": 1
        }
    }
}
```

#### Error Responses

**Forbidden - Regular User (403)**
```json
{
    "success": false,
    "message": "You do not have the required permissions."
}
```

---

### 4.2 Get User by ID

Get a specific user's details (Admin/Moderator only).

#### Request
```
GET {{base_url}}/api/users/{{user_id}}
```

#### Headers
```
Authorization: Bearer {{admin_token}}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "data": {
        "user": {
            "_id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user",
            "isActive": true,
            "createdAt": "2025-11-25T10:00:00.000Z",
            "updatedAt": "2025-11-25T10:00:00.000Z"
        }
    }
}
```

#### Error Responses

**User Not Found (404)**
```json
{
    "success": false,
    "message": "User not found"
}
```

**Invalid ID Format (500)**
```json
{
    "success": false,
    "message": "Error fetching user",
    "error": "Cast to ObjectId failed for value \"invalid-id\" at path \"_id\""
}
```

---

### 4.3 Update User (Admin Only)

Update any user's information.

#### Request
```
PUT {{base_url}}/api/users/{{user_id}}
```

#### Headers
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "firstName": "UpdatedFirst",
    "lastName": "UpdatedLast",
    "email": "updated@example.com",
    "role": "moderator",
    "isActive": true
}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "user": {
            "_id": "674abc123def456789012345",
            "email": "updated@example.com",
            "firstName": "UpdatedFirst",
            "lastName": "UpdatedLast",
            "role": "moderator",
            "isActive": true,
            "createdAt": "2025-11-25T10:00:00.000Z",
            "updatedAt": "2025-11-25T11:00:00.000Z"
        }
    }
}
```

#### Error Responses

**Forbidden - Moderator Trying to Update (403)**
```json
{
    "success": false,
    "message": "You do not have permission to perform this action."
}
```

---

### 4.4 Delete User (Admin Only)

Permanently delete a user.

#### Request
```
DELETE {{base_url}}/api/users/{{user_id}}
```

#### Headers
```
Authorization: Bearer {{admin_token}}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "User deleted successfully"
}
```

#### Error Responses

**User Not Found (404)**
```json
{
    "success": false,
    "message": "User not found"
}
```

**Cannot Delete Self (400)**
```json
{
    "success": false,
    "message": "You cannot delete your own account"
}
```

---

### 4.5 Change User Role (Admin Only)

Change a user's role.

#### Request
```
PATCH {{base_url}}/api/users/{{user_id}}/role
```

#### Headers
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

#### Body (raw JSON)
```json
{
    "role": "moderator"
}
```

#### Valid Roles
- `user`
- `moderator`
- `admin`

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "User role updated successfully",
    "data": {
        "user": {
            "_id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "moderator",
            "isActive": true,
            "createdAt": "2025-11-25T10:00:00.000Z",
            "updatedAt": "2025-11-25T11:00:00.000Z"
        }
    }
}
```

#### Error Responses

**Invalid Role (400)**
```json
{
    "success": false,
    "message": "Invalid role. Must be one of: user, moderator, admin"
}
```

**Cannot Change Own Role (400)**
```json
{
    "success": false,
    "message": "You cannot change your own role"
}
```

---

### 4.6 Deactivate User (Admin Only)

Deactivate a user account (soft delete).

#### Request
```
PATCH {{base_url}}/api/users/{{user_id}}/deactivate
```

#### Headers
```
Authorization: Bearer {{admin_token}}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "User deactivated successfully",
    "data": {
        "user": {
            "_id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user",
            "isActive": false,
            "createdAt": "2025-11-25T10:00:00.000Z",
            "updatedAt": "2025-11-25T11:00:00.000Z"
        }
    }
}
```

#### Error Responses

**Cannot Deactivate Self (400)**
```json
{
    "success": false,
    "message": "You cannot deactivate your own account"
}
```

---

### 4.7 Activate User (Admin Only)

Reactivate a deactivated user account.

#### Request
```
PATCH {{base_url}}/api/users/{{user_id}}/activate
```

#### Headers
```
Authorization: Bearer {{admin_token}}
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "User activated successfully",
    "data": {
        "user": {
            "_id": "674abc123def456789012345",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user",
            "isActive": true,
            "createdAt": "2025-11-25T10:00:00.000Z",
            "updatedAt": "2025-11-25T11:30:00.000Z"
        }
    }
}
```

---

## 5. Utility APIs

### 5.1 Root Endpoint

API welcome message and available endpoints.

#### Request
```
GET {{base_url}}/
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Welcome to RBAC API",
    "version": "1.0.0",
    "endpoints": {
        "health": "/health",
        "auth": "/api/auth",
        "users": "/api/users"
    }
}
```

---

### 5.2 Health Check

Check if server is running.

#### Request
```
GET {{base_url}}/health
```

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Server is running",
    "timestamp": "2025-11-25T10:00:00.000Z",
    "environment": "development"
}
```

---

## 6. Error Responses

### 6.1 Common Error Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 400 | Bad Request | Validation errors, missing fields |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist, invalid route |
| 500 | Server Error | Internal errors |

### 6.2 Authentication Errors

**No Token Provided**
```json
{
    "success": false,
    "message": "Access denied. No token provided."
}
```

**Invalid Token**
```json
{
    "success": false,
    "message": "Invalid token."
}
```

**User Not Found (Token Valid but User Deleted)**
```json
{
    "success": false,
    "message": "User not found."
}
```

**Account Deactivated**
```json
{
    "success": false,
    "message": "User account is deactivated."
}
```

### 6.3 Authorization Errors

**Role Not Authorized**
```json
{
    "success": false,
    "message": "You do not have permission to perform this action."
}
```

**Permission Denied**
```json
{
    "success": false,
    "message": "You do not have the required permissions."
}
```

### 6.4 Route Not Found

```json
{
    "success": false,
    "message": "Route GET /api/invalid not found",
    "error": "Not Found"
}
```

---

## 7. Testing Flow

### 7.1 Recommended Test Order

Follow this sequence to test all APIs:

```
1. GET  /                           → Check API is running
2. GET  /health                     → Health check
3. POST /api/auth/register          → Create regular user
4. POST /api/auth/register          → Create admin user
5. POST /api/auth/register          → Create moderator user
6. POST /api/auth/login             → Login as regular user
7. GET  /api/auth/profile           → Get profile (user token)
8. PUT  /api/auth/profile           → Update profile
9. PUT  /api/auth/change-password   → Change password
10. POST /api/auth/login            → Login as admin
11. GET  /api/users                 → Get all users (admin)
12. GET  /api/users/:id             → Get specific user
13. PUT  /api/users/:id             → Update user
14. PATCH /api/users/:id/role       → Change role
15. PATCH /api/users/:id/deactivate → Deactivate user
16. PATCH /api/users/:id/activate   → Reactivate user
17. DELETE /api/users/:id           → Delete user
```

### 7.2 Test Scenarios

#### Scenario 1: Normal User Flow
1. Register new user
2. Login with credentials
3. View profile
4. Update profile
5. Change password
6. Try accessing `/api/users` (should fail with 403)

#### Scenario 2: Admin User Flow
1. Register admin user
2. Login as admin
3. View all users
4. Update another user's info
5. Change another user's role
6. Deactivate a user
7. Activate a user
8. Delete a user

#### Scenario 3: Moderator User Flow
1. Register moderator user
2. Login as moderator
3. View all users (should work)
4. Try to update user (should fail with 403)
5. Try to delete user (should fail with 403)

#### Scenario 4: Security Tests
1. Access protected route without token (401)
2. Access protected route with invalid token (401)
3. User tries admin route (403)
4. Admin tries to delete self (400)
5. Register with existing email (400)
6. Login with wrong password (401)

---

## 8. Postman Collection Setup

### 8.1 Import Collection

Create a new collection named **RBAC API** with these folders:
- 📁 Auth
  - Register User
  - Register Admin
  - Register Moderator
  - Login
  - Get Profile
  - Update Profile
  - Change Password
- 📁 Users (Admin)
  - Get All Users
  - Get User by ID
  - Update User
  - Delete User
  - Change Role
  - Deactivate User
  - Activate User
- 📁 Utility
  - Root
  - Health Check

### 8.2 Collection Variables

```
base_url: http://localhost:5000
token: (empty - auto-filled)
admin_token: (empty - auto-filled)
user_id: (empty - auto-filled)
```

### 8.3 Pre-request Script (Collection Level)

```javascript
// Set content type for all requests
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});
```

---

## 9. Quick Reference Card

### Base URL
```
http://localhost:5000
```

### Auth Endpoints
```
POST   /api/auth/register         - Register user
POST   /api/auth/login            - Login
GET    /api/auth/profile          - Get profile [Auth]
PUT    /api/auth/profile          - Update profile [Auth]
PUT    /api/auth/change-password  - Change password [Auth]
```

### User Endpoints (Protected)
```
GET    /api/users                 - List users [Mod+]
GET    /api/users/:id             - Get user [Mod+]
PUT    /api/users/:id             - Update user [Admin]
DELETE /api/users/:id             - Delete user [Admin]
PATCH  /api/users/:id/role        - Change role [Admin]
PATCH  /api/users/:id/deactivate  - Deactivate [Admin]
PATCH  /api/users/:id/activate    - Activate [Admin]
```

### Headers Template
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

---

*Happy Testing! 🚀*
