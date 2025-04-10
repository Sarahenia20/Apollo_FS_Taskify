var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { default: mongoose } = require("mongoose");
const helmet = require("helmet");
const cors = require('cors'); // Add cors for cross-origin support

/* routers */
const authRouter = require("./routes/auth.router");
const usersRouter = require("./routes/users.router");
const roleRouter = require("./routes/roles.router");
const fakeRouter = require("./routes/faker.router");
const tasksRouter = require("./routes/tasks.router");
const commentsRouter = require("./routes/comments.router");
const notificationsRouter = require("./routes/notifications.router");
const twoFactorAuthRouter = require("./routes/twoFactorAuth.router");
const projectsRouter = require("./routes/projects.router");
const loginActivityRoutes = require('./routes/loginActivity');
const testEmailRoute = require('./routes/test.route');
const imagesRouter = require('./routes/images.router');
const taskGeneratorRouter = require("./routes/tasksGenerator.router");

const io = require("./socket");
const passport = require("passport");
require("dotenv").config();

var app = express();

// Enable CORS if needed
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true
}));

// Configure helmet for content security policy 
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

// Add basic request logging middleware
app.use(logger("dev"));

// IMPORTANT: Body parsing middleware needs to come BEFORE routes
// Increased limits for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debugging middleware - place after body parsers but before routes
const debugMiddleware = (req, res, next) => {
  console.log('Request Details:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
};
app.use(debugMiddleware);

// Passport JWT configuration
require("./middlewares/passport-jwt")(passport);

// MongoDB Connection with improved error handling
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((cnn) =>
    console.log(
      "Connected to Database successfully !!",
      cnn.connections[0].host
    )
  )
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    console.log(err);
  });

// Static file serving
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static('uploads'));

// Route registration
app.use("/api", [
  projectsRouter,
  authRouter,
  usersRouter,
  roleRouter,
  fakeRouter,
  tasksRouter,
  commentsRouter,
  notificationsRouter,
  taskGeneratorRouter
]);

// Additional routes
app.use("/api/auth/2fa", twoFactorAuthRouter);
app.use('/api/login-activity', loginActivityRoutes);
app.use('/api/test-email', testEmailRoute);
app.use('/api/images', imagesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

module.exports = app;