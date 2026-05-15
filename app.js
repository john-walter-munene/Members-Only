require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./middleware/auth");
const pgSession = require("connect-pg-simple")(session);
const app = express();
const path = require("node:path");
const pool = require("./db/pool");
const authRouter = require("./routes/authRouter");
const indexRouter = require("./routes/indexRouter");

// Templating engine setup.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serving static assets.
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Bodyparser setup, and authentication session setup.
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "users_sessions",
    }),
    secret: "cats",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false,
    },
  })
);

// Passport setup.
app.use(passport.initialize());
app.use(passport.session());

// Make the current user available in all views.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routes.
app.use(authRouter);
app.use(indexRouter);

// Error Handling
app.use((error, request, response, next) => {
    console.log(error);
    response.status(error.statusCode || 500).render("404");
});

const PORT = Number(process.env.PORT) || 3000;

// Start the server.
app.listen(PORT, (error) => {
    if (error) throw new Error(error);
    console.log(`Server is running on port ${PORT}`);
});