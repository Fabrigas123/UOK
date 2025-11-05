// src/middleware/authMiddleware.js
// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================
// This middleware protects routes by verifying JWT tokens
// It runs BEFORE controller functions on protected routes

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// =====================================================
// WHAT IS MIDDLEWARE?
// =====================================================
// Middleware is a function that has access to:
// - req (request object)
// - res (response object)  
// - next (function to pass control to next middleware/controller)
//
// Middleware can:
// 1. Execute any code
// 2. Modify req and res objects
// 3. End the request-response cycle
// 4. Call next() to pass control to next function
//
// Think of it as a "checkpoint" before reaching the controller

// =====================================================
// REQUEST FLOW WITH MIDDLEWARE:
// =====================================================
// Client Request 
//    ↓
// Route Handler
//    ↓
// Middleware (this file) ← checks authentication
//    ↓
// Controller (if middleware calls next())
//    ↓
// Response to Client

// =====================================================
// AUTHENTICATION MIDDLEWARE FUNCTION
// =====================================================
const authenticateToken = async (req, res, next) => {
  // =================================================
  // STEP 1: GET TOKEN FROM REQUEST HEADER
  // =================================================
  // Tokens are sent in the Authorization header
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  //         ^-----^  ^----------------------------------------^
  //         Type     Token
  
  const authHeader = req.headers['authorization'];
  
  // Extract token from "Bearer TOKEN" format
  // authHeader might be: "Bearer abc123xyz"
  // We split by space and take second part: "abc123xyz"
  const token = authHeader && authHeader.split(' ')[1];

  // =================================================
  // STEP 2: CHECK IF TOKEN EXISTS
  // =================================================
  if (!token) {
    // No token provided = unauthorized access attempt
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
    // When we return here, next() is NOT called
    // So the controller function never runs
  }

  // =================================================
  // STEP 3: VERIFY TOKEN
  // =================================================
  try {
    // jwt.verify() does several things:
    // 1. Checks if token is properly formatted
    // 2. Verifies signature using JWT_SECRET
    // 3. Checks if token has expired
    // 4. Decodes the payload
    //
    // If ANY check fails, it throws an error
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // WHAT DOES 'decoded' CONTAIN?
    // It's the payload we put in when creating the token:
    // {
    //   userId: 1,
    //   email: "john@example.com",
    //   username: "john_doe",
    //   iat: 1234567890,  ← issued at (timestamp)
    //   exp: 1234654290   ← expiration (timestamp)
    // }

    // =================================================
    // STEP 4: VERIFY USER STILL EXISTS
    // =================================================
    // Token might be valid but user could be deleted
    // Always good to double-check with database
    
    const user = await User.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found. Token invalid.' 
      });
    }

    // =================================================
    // STEP 5: ATTACH USER INFO TO REQUEST OBJECT
    // =================================================
    // Add user information to req object
    // Now any controller can access req.user
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username
    };

    // =================================================
    // STEP 6: CALL next()
    // =================================================
    // This passes control to the next middleware or controller
    // Without calling next(), request hangs and never responds
    next();

  } catch (error) {
    // =================================================
    // HANDLE TOKEN VERIFICATION ERRORS
    // =================================================
    
    // Different types of JWT errors:
    
    if (error.name === 'JsonWebTokenError') {
      // Token is malformed or signature is invalid
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      // Token has expired
      return res.status(401).json({ 
        error: 'Token has expired. Please login again.' 
      });
    }

    // Any other error
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Server error during authentication' 
    });
  }
};

// =====================================================
// OPTIONAL: ROLE-BASED AUTHORIZATION MIDDLEWARE
// =====================================================
// This is an example for future expansion
// Use this AFTER authenticateToken middleware

const authorizeRoles = (...allowedRoles) => {
  // This is a middleware factory
  // It returns a middleware function
  
  return (req, res, next) => {
    // req.user.role would need to be added to user model and JWT payload
    
    if (!req.user.role) {
      return res.status(403).json({ 
        error: 'No role assigned to user' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// USAGE EXAMPLE:
// router.get('/admin', authenticateToken, authorizeRoles('admin'), adminController);
// This route requires user to be authenticated AND have 'admin' role

// =====================================================
// EXPORT MIDDLEWARE
// =====================================================
module.exports = {
  authenticateToken,
  authorizeRoles  // For future use
};

// =====================================================
// HOW TO USE THIS MIDDLEWARE IN ROUTES:
// =====================================================
// const { authenticateToken } = require('../middleware/authMiddleware');
//
// Public route (no middleware):
// router.post('/register', userController.registerUser);
//
// Protected route (with middleware):
// router.get('/users', authenticateToken, userController.getAllUsers);
//                      ^--------------^
//                      This runs first!

// =====================================================
// TESTING AUTHENTICATION
// =====================================================
// 
// 1. Login to get token:
//    POST /api/users/login
//    Body: { "email": "john@example.com", "password": "pass123" }
//    Response: { "token": "eyJhbGci..." }
//
// 2. Use token for protected route:
//    GET /api/users
//    Header: Authorization: Bearer eyJhbGci...
//
// 3. Common mistakes:
//    ❌ Forgetting "Bearer " prefix
//    ❌ Sending token in wrong header
//    ❌ Token expired
//    ❌ Wrong JWT_SECRET in .env

// =====================================================
// SECURITY BEST PRACTICES
// =====================================================
// 1. Always use HTTPS in production (tokens sent in headers)
// 2. Set reasonable token expiration (24h is good balance)
// 3. Never log tokens (they're like passwords!)
// 4. Store JWT_SECRET securely (use environment variables)
// 5. Consider refresh tokens for better UX (advanced topic)
// 6. Implement token blacklisting for logout (advanced topic)
