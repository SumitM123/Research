# 🚀 MERN Stack Application

A full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring a connected frontend and backend with a modern, responsive UI.

## 📋 Features

- **Full CRUD Operations**: Create, Read, Update, Delete items
- **Real-time Connection**: Frontend and backend are properly connected
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Priority System**: Items can be categorized by priority (Low, Medium, High)
- **Completion Tracking**: Mark items as completed with visual feedback
- **Error Handling**: Comprehensive error handling and user feedback
- **Connection Testing**: Built-in backend connection testing

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend
- **React.js** - JavaScript library for building user interfaces
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

## 📁 Project Structure

```
mern-stack-project/
├── backend/
│   ├── models/
│   │   └── Item.js
│   ├── routes/
│   │   └── items.js
│   ├── package.json
│   ├── server.js
│   └── env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── reportWebVitals.js
│   └── package.json
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-stack-project
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp backend/env.example backend/.env
   
   # Edit the .env file with your MongoDB connection string
   # MONGODB_URI=mongodb://localhost:27017/mern-app
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # Start both frontend and backend
   npm start
   
   # Or start them separately
   npm run server  # Backend only (port 5000)
   npm run client  # Frontend only (port 3000)
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/items

## 📡 API Endpoints

### Items API (`/api/items`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Item Schema

```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 500 chars),
  completed: Boolean (default: false),
  priority: String (enum: 'low', 'medium', 'high', default: 'medium'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Available Scripts

### Root Directory
- `npm start` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run dev` - Start both in development mode
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build frontend for production

### Backend Directory
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Directory
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔒 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mern-app

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🎨 Features in Detail

### Frontend Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Immediate UI updates after API calls
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Form Validation**: Client-side validation for better UX
- **Priority Indicators**: Color-coded priority badges
- **Completion Tracking**: Visual completion status

### Backend Features
- **RESTful API**: Standard REST endpoints
- **Data Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error responses
- **CORS Configuration**: Proper cross-origin setup
- **Security Middleware**: Helmet for security headers
- **Request Logging**: Morgan for HTTP request logging

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change the port in `.env` file
   - Kill processes using the ports

3. **CORS Errors**
   - Verify the frontend URL in backend CORS configuration
   - Check if both servers are running

4. **Module Not Found Errors**
   - Run `npm run install-all` to install all dependencies
   - Check if all package.json files are present

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Express.js team for the web framework
- MongoDB team for the database
- The open-source community for various packages used

---

**Happy Coding! 🎉**
