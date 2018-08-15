const express = require("express");
const router = express.Router();
const User = require("../models/user");

const { jwtAuth, localAuth } = require("../passport/strategies");

router.post("/record", [express.json(), jwtAuth], (req, res) => {
  console.log(req.user);
  User.findOneAndUpdate(
    { username: req.user.username },
    { $inc: { highestRound: 1 } },
    { new: true }
  ).then(x => {
    console.log(x);
    res.send(x);
  });
});

module.exports = router;
