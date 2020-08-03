const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A User must have a name'],
      maxlength: [40, 'The User name cant be more than 40 characters'],
      minlength: [3, 'The User name must be more than 10 characters'],
    },
    email: {
      type: String,
      required: [true, 'A User must have a name'],
      unique: [true, 'Email already exist'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password should be at least 6 characters'],
      select: false, //wont send passwords in get querries -- will still appear in save
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This works only on Create and Save not update
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    photo: { type: String, default: 'default.jpg' },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  // Only run this function if password was moddified (not on other update functions)
  if (!this.isModified('password')) return next();
  // Hash password with strength of 12
  this.password = await bcrypt.hash(this.password, 12);
  //remove the confirm field which will work since we are saving and passed calling
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //To avoid delay in setting this and creating token
  next();
});

//Querry middleware to make sure user is active
userSchema.pre(/^find/, function (next) {
  //this points to active query
  this.find({ active: { $ne: false } });
  next();
});
//instance method - a method available on all documents of a collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // will return true or false
};
// Changed password instance method
userSchema.methods.changedPasswordAfter = function (timeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return timeStamp < changedTimeStamp;
  }

  return false;
};
// Password reset token method
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 3600000; //1 hr
  return resetToken;
};
// Creating Model
const User = mongoose.model('User', userSchema);

module.exports = User;
