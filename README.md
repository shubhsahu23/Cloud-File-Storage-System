# Cloud File Storage System

Cloud File Storage System is a full-stack web app for secure file uploads, storage, and management. The backend is built with FastAPI and MongoDB, and the frontend is built with React and Vite.

## What It Does

- Lets users register and log in securely.
- Issues a JWT token after successful login.
- Stores uploaded files in AWS S3.
- Saves file metadata in MongoDB.
- Protects file actions so only the signed-in user can access their own files.
- Enforces a 1 GB storage limit per user.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, React Icons
- Backend: FastAPI, Motor, MongoDB, JWT, bcrypt, Boto3
- Storage: AWS S3

## How It Works

### 1. Authentication Flow

1. A user registers with a name, email, and password.
2. The backend hashes the password before saving it in MongoDB.
3. During login, the backend checks the email and password.
4. If the credentials are valid, the backend returns a JWT access token.
5. The frontend stores that token in `localStorage`.
6. Protected requests send the token in the `Authorization: Bearer <token>` header.

### 2. File Upload Flow

1. The user selects a file from the dashboard.
2. The frontend sends the file to the backend.
3. The backend checks the logged-in user from the JWT token.
4. The backend checks how much storage the user has already used.
5. If the total is within the 1 GB limit, the file is uploaded to AWS S3.
6. File metadata such as filename, size, type, owner, and URL is saved in MongoDB.

### 3. File Management Flow

- `GET /files/my-files` returns the authenticated user’s uploaded files.
- `GET /files/{file_id}` fetches one file record owned by the user.
- `DELETE /files/{file_id}` removes the file from S3 and deletes its metadata from MongoDB.

## Project Structure

- `backend/` - FastAPI API, database logic, authentication, and file services
- `frontend/` - React app with login, register, dashboard, and protected routing

### Backend Highlights

- `app/main.py` - FastAPI app entry point and route registration
- `app/routes/auth.py` - Register and login endpoints
- `app/routes/files.py` - File upload, fetch, and delete endpoints
- `app/services/auth_service.py` - Password hashing and JWT creation
- `app/services/file_service.py` - S3 upload, file lookup, and deletion logic
- `app/utils/security.py` - Token verification and current-user lookup

### Frontend Highlights

- `pages/Login.jsx` - Login form and token storage
- `pages/Register.jsx` - Registration form
- `pages/Dashboard.jsx` - File management screen
- `components/ProtectedRoute.jsx` - Blocks unauthenticated access
- `api/axios.js` - Shared Axios client for backend requests

## Setup

### Backend

1. Open a terminal in `backend/`.
2. Create and activate a virtual environment.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file from `example.env` and fill in your values.
5. Start the API server:

```bash
uvicorn app.main:app --reload
```

### Frontend

1. Open a terminal in `frontend/`.
2. Install dependencies:

```bash
npm install
```

3. Start the Vite dev server:

```bash
npm run dev
```

## Environment Variables

The backend expects these variables:

```env
MONGO_URL=your-mongodb-url
DATABASE_NAME=your-database-name
SECRET_KEY=your-secret-key
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=your-aws-region
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and receive a JWT token
- `GET /auth/me` - Get the current authenticated user

### Files

- `POST /files/upload` - Upload a file
- `GET /files/my-files` - Get files for the current user
- `GET /files/{file_id}` - Get a single file record
- `DELETE /files/{file_id}` - Delete a file

## Notes

- The frontend login request must send JSON with `email` and `password`.
- The backend CORS settings already allow the local Vite dev servers on ports `5173` and `5174`.
- The app is designed for user-specific storage, so all file actions are protected by JWT authentication.
