# Task Manager - Client

A modern task management application built with React, Vite, and Tailwind CSS.

## Features

- 🔐 User Authentication (Login/Register)
- 📋 Task Management (Create, Read, Update, Delete)
- 🎨 Dark/Light Theme Toggle
- 📱 Responsive Design
- ⚡ Fast Development with Vite
- 🎯 Modern UI with Tailwind CSS

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Context API** - State Management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:5000

## Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── api/            # API client and utilities
│   │   └── api.js
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── Layout.jsx
│   │   └── ThemeToggle.jsx
│   ├── context/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── TaskManagement.jsx
│   ├── App.jsx         # Main App component
│   ├── index.css       # Global styles
│   ├── main.jsx        # Entry point
│   └── routes.jsx      # Route definitions
├── .env                # Environment variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- User registration with validation
- Secure login with JWT tokens
- Protected routes
- Automatic token refresh

### Task Management
- Create tasks with title, description, priority, and due date
- Update task status (Pending, In Progress, Completed)
- Edit and delete tasks
- Filter tasks by status and priority
- Sort tasks by date or priority

### Theme
- Light/Dark mode toggle
- Persisted theme preference
- Smooth theme transitions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Troubleshooting

### Port already in use
If port 3000 is already in use, you can change it in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3001, // Change to any available port
  }
})
```

### API connection issues
Make sure the backend server is running and the VITE_API_URL in `.env` is correct.

## License

MIT
