const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please tell your firstname"],
      trim: true,
      maxLength: [20, "A firstname must have less or equal then 20 characters"],
      minLength: [2, "A firstname must have more or equal then 2 characters"],
    },
    surname: {
      type: String,
      required: [true, "Please tell your surename"],
      trim: true,
      maxLength: [20, "A surename must have less or equal then 20 characters"],
      minLength: [2, "A surename must have more or equal then 2 characters"],
    },
    // username: {
    //   type: String,
    //   unique: true,
    //   required: [true, "Please tell your username"],
    //   trim: true,
    //   maxLength: [20, "A username must have less or equal then 20 characters"],
    //   minLength: [2, "A username must have more or equal then 2 characters"],
    // },
    email: {
      type: String,
      required: [true, "A user must have a Email"],
      unique: true,
      trim: true,
      lowerCase: true,
      validate: [validator.isEmail, "Pleade provide a valid email"],
    },
    photo: {
      type: String,
      default: "public/images/users/default-png.png",
    },
    role: {
      type: String,
      enum: ["user", "artist", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLenght: [
        8,
        "A user password must have more or equal then 8 characters",
      ],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only work on CREATE and SAVE.
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the Same!",
      },
    },
    aboutMe: {
      type: String,
      trim: true,
    },
    myProjects: {
      type: String,
      trim: true,
    },
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

// Virtual populate
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified.
  if (!this.isModified("password")) return next();
  // Hash the Password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Compare the candaidate password (The Given Password) with the userPassword (The password in the DB)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordRestToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
