<<<<<<< HEAD
// middlewares/passport-jwt.js
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const UsersModel = require("../models/users");

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PRIVATE_KEY
  };

  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await UsersModel.findOne({ _id: jwt_payload.id }).populate('role');

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }));
};
=======
const usersModel = require("../models/users");
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.PRIVATE_KEY;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        const user = await usersModel.findOne({ _id: jwt_payload.id });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
