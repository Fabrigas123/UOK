-- =====================================================
-- DATABASE SETUP SCRIPT
-- =====================================================
-- Run these commands in PostgreSQL to set up the database

-- =====================================================
-- STEP 1: CREATE DATABASE
-- =====================================================
-- Note: You need to be connected to PostgreSQL first
-- Using psql: psql -U postgres
-- Or use pgAdmin GUI

CREATE DATABASE user_management_db;

-- =====================================================
-- STEP 2: CONNECT TO THE DATABASE
-- =====================================================
-- In psql, run:
-- \c user_management_db

-- =====================================================
-- STEP 3: CREATE USERS TABLE
-- =====================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE STRUCTURE EXPLANATION
-- =====================================================
-- id: Auto-incrementing unique identifier for each user
-- username: User's chosen username (must be unique)
-- email: User's email address (must be unique)
-- password: Hashed password (never store plain text!)
-- created_at: Timestamp of when user registered

-- =====================================================
-- STEP 4: CREATE INDEXES (OPTIONAL BUT RECOMMENDED)
-- =====================================================
-- Indexes improve query performance for frequently searched columns

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- =====================================================
-- STEP 5: VERIFY TABLE CREATION
-- =====================================================
-- Run this to see table structure:
-- \d users

-- Expected output:
--                                     Table "public.users"
--    Column    |            Type             |                     Modifiers
-- -------------+-----------------------------+---------------------------------------------------
--  id          | integer                     | not null default nextval('users_id_seq'::regclass)
--  username    | character varying(50)       | not null
--  email       | character varying(100)      | not null
--  password    | character varying(255)      | not null
--  created_at  | timestamp without time zone | default CURRENT_TIMESTAMP

-- =====================================================
-- STEP 6: INSERT TEST DATA (OPTIONAL)
-- =====================================================
-- You can insert test data, but remember passwords should be hashed!
-- It's better to use the API to register users
-- But if you want to test the database directly:

-- INSERT INTO users (username, email, password) 
-- VALUES ('test_user', 'test@example.com', '$2b$10$...');
-- (Use bcrypt to generate hash first!)

-- =====================================================
-- USEFUL QUERIES FOR TESTING
-- =====================================================

-- View all users (without passwords):
-- SELECT id, username, email, created_at FROM users;

-- Count total users:
-- SELECT COUNT(*) FROM users;

-- Find user by email:
-- SELECT * FROM users WHERE email = 'john@example.com';

-- Delete all users (BE CAREFUL!):
-- DELETE FROM users;

-- Delete specific user:
-- DELETE FROM users WHERE id = 1;

-- =====================================================
-- STEP 7: GRANT PERMISSIONS (if needed)
-- =====================================================
-- If you're using a specific database user (not postgres):

-- GRANT ALL PRIVILEGES ON DATABASE user_management_db TO your_username;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- Check if database exists:
-- \l

-- Check if table exists:
-- \dt

-- Check table structure:
-- \d users

-- Drop table (delete everything - BE CAREFUL!):
-- DROP TABLE IF EXISTS users;

-- Drop database (delete everything - BE VERY CAREFUL!):
-- DROP DATABASE IF EXISTS user_management_db;

-- =====================================================
-- FOR STUDENTS: EXTENDED ASSIGNMENT TABLES
-- =====================================================
-- These are for the Blog Post assignment

-- Posts table:
-- CREATE TABLE posts (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(200) NOT NULL,
--     content TEXT NOT NULL,
--     author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Comments table:
-- CREATE TABLE comments (
--     id SERIAL PRIMARY KEY,
--     post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
--     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Create indexes for posts:
-- CREATE INDEX idx_posts_author ON posts(author_id);
-- CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Create indexes for comments:
-- CREATE INDEX idx_comments_post ON comments(post_id);
-- CREATE INDEX idx_comments_user ON comments(user_id);

-- =====================================================
-- BACKUP AND RESTORE
-- =====================================================

-- Backup database (from terminal, not in psql):
-- pg_dump -U postgres user_management_db > backup.sql

-- Restore database (from terminal):
-- psql -U postgres user_management_db < backup.sql

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- See active connections:
-- SELECT * FROM pg_stat_activity WHERE datname = 'user_management_db';

-- See table size:
-- SELECT pg_size_pretty(pg_total_relation_size('users'));

-- See all indexes:
-- SELECT * FROM pg_indexes WHERE tablename = 'users';

-- =====================================================
-- DATABASE SETUP COMPLETE!
-- =====================================================
-- Now you can:
-- 1. Update your .env file with database credentials
-- 2. Run the Node.js application
-- 3. Test the API endpoints
