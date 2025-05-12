var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { default: mongoose } = require("mongoose");
const helmet = require("helmet");
const cors = require('cors');
const passport = require("passport");

/* routers */
const authRouter = require("./routes/auth.router");
const smartAssignRouter = require("./routes/smartAssign.router");
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
const chatbotRouter = require("./routes/chatbot.router");
const videoCallRoutes = require("./routes/VideoCall.router");
const chatRouter = require("./routes/chats.router");
const predictionRoutes = require('./routes/predictionRoutes');
const teamsRouter = require("./routes/teams.router");
const teamPostsRouter = require("./routes/teamPosts.router");
const gamesRouter = require("./routes/gameRoom"); // consider renaming to games.router.js for consistency
const activityRoutes = require('./routes/activityRoutes');
const seedRoutes = require('./routes/seedRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const taskPrioritiesRouter = require('./routes/taskPriorities'); // NEW: Added task priorities router

const io = require("./socket");
require("dotenv").config();
const { MOCK_TYPE } = require('./constants/MOCK_TYPE');
global.MOCK_TYPE = MOCK_TYPE;

var app = express();

// Enable CORS
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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debugging middleware
const debugMiddleware = (req, res, next) => {
  console.log('Request Details:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
};
app.use(debugMiddleware);

// Passport initialization
require("./middlewares/passport-jwt")(passport);
app.use(passport.initialize());

// Unprotected routes
app.use("/api", authRouter);
app.use("/api/auth/2fa", twoFactorAuthRouter);
app.use('/api/test-email', testEmailRoute);
app.use('/api/seed', seedRoutes);
app.use("/api/smart-assign", smartAssignRouter);

// UPDATED: Import the correct activity logger middleware
const activityLoggerMiddleware = require('./middlewares/activityLoggerMiddleware');

// UPDATED: Protected routes with JWT authentication and activity logger middleware
// FIXED: Removed chatbotRouter from this array
app.use("/api", passport.authenticate('jwt', { session: false }), activityLoggerMiddleware, [
  projectsRouter,
  usersRouter,
  roleRouter,
  fakeRouter,
  tasksRouter,
  commentsRouter,
  notificationsRouter,
  teamsRouter,
  teamPostsRouter,
  taskGeneratorRouter,
  gamesRouter,
  chatRouter,
  predictionRoutes,
  loginActivityRoutes,
  imagesRouter,
  videoCallRoutes
]);

// FIXED: Added separate mounting point for chatbot router
app.use("/api/chatbot", passport.authenticate('jwt', { session: false }), activityLoggerMiddleware, chatbotRouter);

// UPDATED: Activity routes with proper authentication (remove duplicate middleware)
app.use("/api/activities", passport.authenticate('jwt', { session: false }), activityRoutes);

// NEW: Task priorities route (this is what your frontend is looking for)
app.use('/api/tasks', passport.authenticate('jwt', { session: false }), taskPrioritiesRouter);

// Stats and dashboard routes (these can remain as they are)
app.use('/api/activities/stats', statsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/games", passport.authenticate('jwt', { session: false }), activityLoggerMiddleware, gamesRouter);

// REMOVED: The old priorities route that was causing conflicts
// app.use('/api/priorities', prioritiesRoutes);

// MongoDB Connection
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

module.exports = app;