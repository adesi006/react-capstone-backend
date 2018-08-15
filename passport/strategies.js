const passport = require("passport");

/* 
  since both passport-local and passport-jwt expose objects called "strategy",
we use a shorthand to destructure and rename the objects at the same time.
*/
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

//require in the user model
const User = require("../models/user");

//and the secret
const { JWT_SECRET } = require("../config");

//localstrategy takes the username, password from the req.body, and a callback
//the callback will validate the request body.
const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: "LoginError",
          //purposely vague so hackers can't fish for usernames
          message: "Incorrect username or password"
        });
      }
      //this is the method that we gave to the User model
      return user.validatePassword(password);
    })
    .then(validPassword => {
      if (!validPassword) {
        return Promise.reject({
          reason: "LoginError",
          message: "Incorrect username or password"
        });
      }
      return callback(null, user);
    })
    .catch(err => {
      if (err.reason === "LoginError") {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

const jwtStrategy = new JwtStrategy(
  {
    //identify your secret/key
    secretOrKey: JWT_SECRET,
    //tell passport where to look for the token using ExtractJwt
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    //only allow HS256 tokens??? --ask about this
    algorithms: ["HS256"]
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

const jwtAuth = passport.authenticate("jwt", { session: false });
const localAuth = passport.authenticate("local", { session: false });

module.exports = { localStrategy, jwtStrategy, jwtAuth, localAuth };
