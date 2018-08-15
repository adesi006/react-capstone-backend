const express = require("express");
const router = express.Router();
const User = require("../models/user");

//DELETE THIS
// router.get("/", (req, res, next) => {
//   User.find().then(result => {
//     if (result) {
//       res.json(result);
//     } else {
//       next();
//     }
//   });
// });
//

//Route so user can register
router.post("/register", express.json(), (req, res, next) => {
  let { username, password } = req.body;
  //checks that required fields are in body
  const requiredFields = ["username", "password"];
  const missingField = requiredFields.find(field => !(field in req.body));

  //response object contrived to notify users of error
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      location: missingField
    });
  }

  //validate that all fields are strings
  const stringFields = ["username", "password"];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== "string"
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }

  //validate that the password doesn't start or end with white space
  const explicitlyTrimmedFields = ["username", "password"];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  //response object contrived to notify users of error
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }

  //validate password conforms to length constraints
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      "min" in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      "max" in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  //response object contrived to notify users of error
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  //finally, we check and see if anyone has that username already
  User.find({ username })
    .countDocuments()
    .then(count => {
      if (count > 0) {
        // if there is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Username already taken",
          location: "username"
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      User.create({
        username,
        password: hash,
        highestRound: 0
      })
        .then(newUser => {
          if (newUser) {
            res.json(newUser);
          } else {
            next();
          }
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});
module.exports = router;
