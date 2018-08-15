const express = require("express");
const mongoose = require("mongoose");
const { PORT } = require("./config");
const passport = require("passport");

const app = express();

const { localStrategy, jwtStrategy } = require("./passport/strategies");

const gameRouter = require("./routes/game-router");
const authRouter = require("./routes/auth-router");
const userRouter = require("./routes/user-router");
const { dbConnect } = require("./db.js");

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use("/api/game", gameRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

// Catch-all 404
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get("env") === "development" ? err : {}
  });
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on("error", err => {
      console.error("Express failed to start");
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}
