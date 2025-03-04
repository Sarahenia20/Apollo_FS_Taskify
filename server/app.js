var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { default: mongoose } = require("mongoose");
const helmet = require("helmet");
<<<<<<< HEAD
const seedRoles = require("./seeds/roleSeeding"); 
=======
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
/* routers */
const authRouter = require("./routes/auth.router");
const usersRouter = require("./routes/users.router");
const roleRouter = require("./routes/roles.router");
const fakeRouter = require("./routes/faker.router");
const tasksRouter = require("./routes/tasks.router");
const commentsRouter = require("./routes/comments.router");
const notificationsRouter = require("./routes/notifications.router");
const io = require("./socket");
const passport = require("passport");

require("dotenv").config();
var app = express();
<<<<<<< HEAD
require('./middlewares/passport-jwt')(passport);
=======

>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
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

<<<<<<< HEAD
mongoose
  .connect(process.env.MONGO_URI)
  .then(async (cnn) => {
    console.log(
      "Connected to DataBase successfully !!",
      cnn.connections[0].host
    );
    
    // Add this block to seed roles after database connection
    try {
      await seedRoles();
    } catch (seedError) {
      console.error('Error during role seeding:', seedError);
    }
  })
=======
require("./middlewares/passport-jwt")(passport);
mongoose
  .connect(process.env.MONGO_URI)
  .then((cnn) =>
    console.log(
      "Connected to DataBase successfully !!",
      cnn.connections[0].host
    )
  )
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
  .catch((err) => console.log(err));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", [
  authRouter,
  usersRouter,
  roleRouter,
  fakeRouter,
  tasksRouter,
  commentsRouter,
  notificationsRouter,
]);

module.exports = app;
