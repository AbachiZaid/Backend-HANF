const fs = require("fs");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const monogoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const artRouter = require("./routes/artRoutes");
const eventRouter = require("./routes/eventRoutes");
const commentRouter = require("./routes/commentRoutes");

// Start express app
const app = express();

// 1) GLOBAL MIDDLEWARES
// Serving static files
// app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/public/images/posts",
  express.static(path.join("public", "images", "posts"))
);

app.use(
  "/public/images/users",
  express.static(path.join("public", "images", "users"))
);

app.use(
  "/public/images/Events",
  express.static(path.join("public", "images", "Events"))
);

app.use("/public/media", express.static(path.join("public", "media")));

app.use("/public/audioImg", express.static(path.join("public", "audioImg")));

//Set security HTTP header
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour",
// });
// app.use("/api", limiter);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// body-parser
app.use(bodyParser.json());

// Body paraser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against XSS NoSQL query injection
app.use(monogoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["title", "price", "createdAt", "description", "post"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/arts", artRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/comments", commentRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
