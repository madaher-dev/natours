const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    ),
    //secure: true, Only true in production
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);

  user.password = undefined; //avoids sending password in response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide an email and a password', 400));
  }
  const user = await User.findOne({ email }).select('+password'); // same as  email: email
  // const correct = await user.correctPassword(password, user.password); - we can use this because email might not exist
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid Credentials', 401));
  }
  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //Get token and check if it is there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('No token, authorization denied!', 401));
  // Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('Invalid token! User does not exist', 401));

  // Check if password did not change

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Invalid token! User recently changed Password', 401)
    );
  }
  //Grant Access
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  //array of argument roles
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on requested arguments
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with such email address', 404));

  //Generate the random reset token and save it to DB
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Send token to user by email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? ${resetURL}\n Please ignore if you didnt request this!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset your Password',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email sending failed! Try again later.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // set password if token is not expired and no user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('User is invalid or token has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // update changedPasswordAt field

  //Login the user. Send token
  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from DB
  const user = await User.findById(req.user.id).select('+password');

  //User.findByIdAndUpdate will not work

  // Check if posted password is correct
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    next(
      new AppError(
        'Your current password does not match the one on our records!',
        401
      )
    );
  }

  // Update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // send new token
  sendToken(user, 200, res);
});
