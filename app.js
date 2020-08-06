const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controlers/errorControler');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Global Middleware

// Routing to static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Header

app.use(helmet());

// Development Logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Rate Limitter
const limitter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Max request limit reached. Try again in 1 hour',
});
app.use('/api', limitter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10Kb' }));
// Form parser in update user data
app.use(express.urlencoded({ extended: true, limit: '10Kb' }));

// Cookie Parser
app.use(cookieParser());

// Data Sanitization against NoSQL query Injection ex: "email": {"$gt":""}
app.use(mongoSanitize());

// Data Sanitization against XSS (cross site scripting)
app.use(xss());

//Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
    ],
  })
);

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers)
  next();
});

// Mounting Routes

app.use('/', viewRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Unhandled routes. this point in code will only be reached if an unhandled route is called
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error handler
app.use(globalErrorHandler);
module.exports = app;
