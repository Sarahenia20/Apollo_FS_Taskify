var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { default: mongoose } = require("mongoose");
const helmet = require("helmet");
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
// Import the images router
const imagesRouter = require('./routes/images.router');
const taskGeneratorRouter=require("./routes/tasksGenerator.router");
const io = require("./socket");
const passport = require("passport");

require("dotenv").config();
var app = express();

// Configure helmet for content security policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // This is the dangerous part
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

require("./middlewares/passport-jwt")(passport);
mongoose
  .connect(process.env.MONGO_URI)
  .then((cnn) =>
    console.log(
      "Connected to DataBase successfully !!",
      cnn.connections[0].host
    )
  )
  .catch((err) => console.log(err));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


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

app.use("/api/auth/2fa", twoFactorAuthRouter);
// Add login activity routes
app.use('/api/login-activity', loginActivityRoutes);
app.use('/api/test-email', testEmailRoute);
// Register the images routes
app.use('/api/images', imagesRouter);

module.exports = app;