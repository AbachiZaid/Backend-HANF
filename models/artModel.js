const mongoose = require("mongoose");
const User = require("./userModel");

const artSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please tell your Art title"],
    trim: true,
    minLength: [2, "Your art title must have more or equal than 2 Characters"],
  },

  audio: String,
  description: {
    type: String,
    // required: [true, "Please tell the desription your art"],
    trim: true,
  },

  image: String,

  price: {
    type: Number,
    // required: [true, "Your art must have a price"],
  },

  musicArt: {
    type: String,
    required: [true, "Your music must have an art"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    required: [true, "An art muss has a user"],
  },
});

artSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstname surname photo",
  });
  next();
});

const Art = mongoose.model("Art", artSchema);

module.exports = Art;
