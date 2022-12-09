const mongoose = require("mongoose");
const validator = require("validator");
// const User = require("./userModel");
const Comment = require("./userModel");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: [true, "Please tell your Post title"],
      trim: true,
      minLength: [2, "A Post must have more or equal than 2 Characters"],
    },

    description: {
      type: String,
      // required: [true, "Please tell the desription your Post"],
      trim: true,
    },

    image: String,

    post: {
      type: String,
      required: [true, "Please write your post, post field can not be empty"],
      trim: true,
      minLength: [5, "Post field must have more or equal then 5 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstname surname photo",
  });
  next();
});

// Virtual populate
postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

// // Virtual populate
// postSchema.virtual("comments", {
//   ref: "Comment",
//   foreignField: "post",
//   localField: "_id",
// });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
