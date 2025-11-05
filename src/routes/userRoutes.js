// src/routes/userRoutes.js
// =====================================================
// USER ROUTES - API ENDPOINT DEFINITIONS
// =====================================================
// This file defines the API endpoints (URLs) and connects them
// to the appropriate controller functions

// Import Express Router
// Router allows us to create modular route handlers
const express = require('express');
const router = express.Router();

// Import controllers (the functions that handle requests)
const userController = require('../controllers/userController');

// Import authentication middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// =====================================================
// WHAT ARE ROUTES?
// =====================================================
// Routes define the API endpoints (URLs) that clients can access
// They map HTTP methods + URLs to controller functions
//
// Format: router.METHOD(PATH, [MIDDLEWARE], CONTROLLER)
//
// Example: router.post('/register', userController.registerUser)
//          When someone sends POST to /register, run registerUser function

// =====================================================
// UNDERSTANDING HTTP METHODS (CRUD OPERATIONS)
// =====================================================
// POST   → CREATE new resource
// GET    → READ/retrieve resource(s)
// PUT    → UPDATE entire resource
// PATCH  → UPDATE part of resource
// DELETE → DELETE resource
//
// RESTful API convention uses these methods appropriately

// =====================================================
// ROUTE 1: USER REGISTRATION
// =====================================================
// Method: POST (we're creating a new user)
// Path: /api/users/register (defined in server.js)
// Access: Public (anyone can register)
// Body: { username, email, password }

router.post('/register', userController.registerUser);

// BREAKDOWN:
// - router.post: Handles POST requests
// - '/register': The endpoint path
// - userController.registerUser: Function to execute
//
// Full URL will be: http://localhost:3000/api/users/register
//                                         ^------^ ^-------^
//                                         base     this file

// =====================================================
// ROUTE 2: USER LOGIN
// =====================================================
// Method: POST (we're creating a session/token)
// Path: /api/users/login
// Access: Public (anyone can attempt to login)
// Body: { email, password }

router.post('/login', userController.loginUser);

// Response will include JWT token that client stores
// Client must send this token for protected routes

// =====================================================
// ROUTE 3: GET ALL USERS
// =====================================================
// Method: GET (we're retrieving data)
// Path: /api/users
// Access: Protected (requires valid JWT token)
// Headers: Authorization: Bearer {token}

router.get('/', authenticateToken, userController.getAllUsers);
//              ^----------------^
//              This middleware runs FIRST
//              If token is valid, controller runs
//              If token is invalid, request is rejected

// MIDDLEWARE EXECUTION ORDER:
// 1. Request comes in
// 2. authenticateToken runs
//    - Verifies token
//    - Adds req.user
//    - Calls next()
// 3. userController.getAllUsers runs
//    - Can access req.user
//    - Fetches and returns data

// =====================================================
// ADDITIONAL ROUTES (for students to implement)
// =====================================================

// Get specific user by ID
// router.get('/:id', authenticateToken, userController.getUserById);

// Update user information
// router.put('/:id', authenticateToken, userController.updateUser);

// Delete user
// router.delete('/:id', authenticateToken, userController.deleteUser);

// Change password
// router.post('/change-password', authenticateToken, userController.changePassword);

// Logout (would invalidate token - requires additional setup)
// router.post('/logout', authenticateToken, userController.logout);

// =====================================================
// UNDERSTANDING ROUTE PARAMETERS
// =====================================================
// URL: /api/users/123
// Route: router.get('/:id', ...)
//        The :id is a parameter
//        Access it with: req.params.id → "123"
//
// Example:
// router.get('/:id', (req, res) => {
//   const userId = req.params.id; // "123"
//   // ... fetch user with this ID
// });

// =====================================================
// UNDERSTANDING QUERY PARAMETERS
// =====================================================
// URL: /api/users?page=2&limit=10
// Access with: req.query.page → "2"
//              req.query.limit → "10"
//
// Example:
// router.get('/', (req, res) => {
//   const page = req.query.page || 1;
//   const limit = req.query.limit || 10;
//   // ... implement pagination
// });

// =====================================================
// REST API BEST PRACTICES
// =====================================================
//
// 1. USE NOUNS, NOT VERBS in URLs:
//    ✅ GET /users (good)
//    ❌ GET /getUsers (bad)
//
// 2. USE PLURAL NOUNS:
//    ✅ /users, /products
//    ❌ /user, /product
//
// 3. USE HTTP METHODS CORRECTLY:
//    GET → Read
//    POST → Create
//    PUT/PATCH → Update
//    DELETE → Delete
//
// 4. USE PROPER STATUS CODES:
//    200 → Success
//    201 → Created
//    400 → Bad Request
//    401 → Unauthorized
//    404 → Not Found
//    500 → Server Error
//
// 5. VERSION YOUR API:
//    /api/v1/users
//    /api/v2/users
//
// 6. USE FILTERING, SORTING, PAGINATION:
//    /users?role=admin&sort=created_at&page=2

// =====================================================
// EXPORT ROUTER
// =====================================================
// This makes the router available to server.js
module.exports = router;

// =====================================================
// HOW THIS CONNECTS TO SERVER.JS:
// =====================================================
// In server.js:
// const userRoutes = require('./src/routes/userRoutes');
// app.use('/api/users', userRoutes);
//
// This means:
// - All routes in this file are prefixed with '/api/users'
// - router.post('/register') becomes /api/users/register
// - router.get('/') becomes /api/users

// =====================================================
// TESTING ROUTES WITH CURL
// =====================================================
//
// Register:
// curl -X POST http://localhost:3000/api/users/register \
//   -H "Content-Type: application/json" \
//   -d '{"username":"john","email":"john@example.com","password":"pass123"}'
//
// Login:
// curl -X POST http://localhost:3000/api/users/login \
//   -H "Content-Type: application/json" \
//   -d '{"email":"john@example.com","password":"pass123"}'
//
// Get Users (replace TOKEN with actual token from login):
// curl -X GET http://localhost:3000/api/users \
//   -H "Authorization: Bearer TOKEN"

// =====================================================
// ROUTE ORGANIZATION TIPS
// =====================================================
// As your application grows, you might have multiple route files:
//
// routes/
//   ├── userRoutes.js     (user-related endpoints)
//   ├── productRoutes.js  (product-related endpoints)
//   ├── orderRoutes.js    (order-related endpoints)
//   └── authRoutes.js     (authentication endpoints)
//
// Each file focuses on one resource type
// This follows the Single Responsibility Principle
