const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controlers/errorControler');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(express.static(`${__dirname}/public`)); // Routing to static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting Routers

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// Unhandled routes. this point in code will only be reached if an unhandled route is called
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error handler

app.use(globalErrorHandler);
module.exports = app;
