# Task Manager - MVC Architecture

A full-stack task management application with separate client and server following MVC architecture pattern.

## 🏗️ Architecture Overview

This project follows a clean MVC (Model-View-Controller) architecture with a clear separation between frontend and backend:

```
task-manager/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/        # API client utilities
│   │   ├── assets/     # Static assets
│   │   ├── components/ # Reusable React components
│   │   ├── context/    # React Context providers
│   │   ├── pages/      # Page components (Views)
│   │   └── routes.jsx  # Route definitions
│   └── ...
│
└── server/              # Backend (Node.js + Express)
    ├── controllers/     # Business logic (Controllers)
    ├── models/          # Database schemas (Models)
    ├── routes/          # API endpoints
    ├── middlewares/     # Custom middlewares
    ├── utils/           # Helper utilities
    └── ...
```

## ✨ Features

### Client Features
- 🔐 User authentication (Login/Register)
- 📋 Task management (CRUD operations)
- 🎨 Dark/Light theme toggle
- 📱 Responsive design
- ⚡ Fast development with Vite
- 🎯 Modern UI with Tailwind CSS

### Server Features
- 🔐 JWT-based authentication
- 👤 User management
- 📋 RESTful API
- 🔒 Role-based access control
- 📁 File upload support
- ✅ Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd task-manager
```

2. **Set up the Server**
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
EOF

# Start MongoDB (if not running)
sudo systemctl start mongod
# or using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Start the server
npm run dev
```

3. **Set up the Client** (in a new terminal)
```bash
cd client
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start the client
npm run dev
```

4. **Access the Application**
- Client: http://localhost:3000
- Server: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

### Client Structure
```
client/
├── public/              # Static files
├── src/
│   ├── api/            # API client utilities
│   │   └── api.js      # Axios instance and API methods
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── Layout.jsx
│   │   └── ThemeToggle.jsx
│   ├── context/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components (Views)
│   │   ├── Dashboard.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── TaskManagement.jsx
│   ├── App.jsx         # Main App component
│   ├── index.css       # Global styles
│   ├── main.jsx        # Entry point
│   └── routes.jsx      # Route definitions
├── .env                # Environment variables
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### Server Structure (MVC)
```
server/
├── controllers/         # Controllers (Business Logic)
│   ├── auth.controller.js
│   ├── task.controller.js
│   └── user.controller.js
├── models/             # Models (Database Schemas)
│   ├── task.model.js
│   └── user.model.js
├── routes/             # Routes (API Endpoints)
│   ├── auth.route.js
│   ├── task.route.js
│   └── user.route.js
├── middlewares/        # Middlewares
│   ├── auth.js
│   └── upload.js
├── utils/              # Utilities
│   └── db.utils.js
├── public/             # Static files
│   └── uploads/
├── .env                # Environment variables
├── index.js            # Entry point
└── package.json
```

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Multer

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

## 🔒 Authentication Flow

1. User registers or logs in
2. Server generates JWT token
3. Client stores token in localStorage
4. Client includes token in Authorization header for protected routes
5. Server validates token using middleware
6. Access granted/denied based on token validity

## 🎨 Theme Support

The application supports both light and dark themes:
- Theme preference is stored in localStorage
- Smooth transitions between themes
- System preference detection (optional)

## 📦 Building for Production

### Client
```bash
cd client
npm run build
# Output will be in client/dist
```

### Server
```bash
cd server
# Set environment to production
export NODE_ENV=production
npm start
```

## 🧪 Development Tips

1. **Hot Reload**: Both client and server support hot reload during development
2. **CORS**: Already configured for local development
3. **Error Handling**: Comprehensive error handling on both ends
4. **Validation**: Input validation on both client and server side

## 📝 Environment Variables

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by modern task management applications
- Built with best practices in MVC architecture
- Following E_Office project structure pattern

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Built with ❤️ using React, Node.js, and MongoDB
