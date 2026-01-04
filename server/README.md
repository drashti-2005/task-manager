# Task Manager - Server

A RESTful API for task management built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication
- 👤 User Management
- 📋 Task CRUD Operations
- 🔒 Role-Based Access Control
- 📁 File Upload Support
- 🗄️ MongoDB Database
- ✅ Input Validation

## Tech Stack

- **Node.js** - Runtime Environment
- **Express** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **Multer** - File Upload

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB:
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

Start the production server:
```bash
npm start
```

The API will be available at `http://localhost:5000`

## Project Structure

```
server/
├── controllers/         # Business logic
│   ├── auth.controller.js
│   ├── task.controller.js
│   └── user.controller.js
├── middlewares/        # Custom middlewares
│   ├── auth.js
│   └── upload.js
├── models/             # Database models
│   ├── task.model.js
│   └── user.model.js
├── routes/             # API routes
│   ├── auth.route.js
│   ├── task.route.js
│   └── user.route.js
├── utils/              # Utility functions
│   └── db.utils.js
├── public/             # Static files
│   └── uploads/        # Uploaded files
├── .env                # Environment variables
├── .gitignore
├── index.js            # Entry point
└── package.json
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks?status=pending&priority=high&sortBy=dueDate
Authorization: Bearer {token}
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer {token}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete Project",
  "description": "Finish the task manager project",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-12-31",
  "tags": ["urgent", "work"]
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "in-progress"
}
```

#### Update Task Status
```http
PATCH /api/tasks/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer {token}
```

### Users

#### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer {token}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

#### Delete User (Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

## Database Models

### User Model
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: ['user', 'admin'])
- isActive (Boolean, default: true)
- timestamps

### Task Model
- title (String, required)
- description (String)
- status (String, enum: ['pending', 'in-progress', 'completed'])
- priority (String, enum: ['low', 'medium', 'high'])
- dueDate (Date)
- assignedTo (ObjectId, ref: User)
- createdBy (ObjectId, ref: User)
- completedAt (Date)
- tags (Array of Strings)
- timestamps

## Middleware

### Authentication (auth.js)
- `protect` - Verify JWT token
- `authorize` - Check user roles

### File Upload (upload.js)
- `uploadSingle` - Upload single file
- `uploadMultiple` - Upload multiple files (max 5)
- Allowed types: jpeg, jpg, png, gif, pdf, doc, docx
- Max file size: 5MB

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- Role-based access control
- Input validation
- File upload restrictions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/taskmanager |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment mode | development |

## Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start index.js --name task-manager-api
```

3. Set up a reverse proxy with Nginx
4. Configure SSL certificates
5. Set up MongoDB Atlas for production database

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access to MongoDB

### Port Already in Use
Change the PORT in `.env` file

### JWT Errors
- Verify JWT_SECRET is set
- Check token format in Authorization header

## License

MIT
