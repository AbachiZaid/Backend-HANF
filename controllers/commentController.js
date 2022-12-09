const Comment = require("./../models/commentModel");
const catchAsync = require("./../utilities/catchAsync");

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find();

  res.status(200).json({
    status: "SUCCESS",
    results: comments.length,
    data: {
      comments,
    },
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user.id;
  // const pId = req.params.postId;
  // console.log(req.user.id);

  const newComment = await Comment.create(req.body);

  res.status(200).json({
    status: "SUCCESS",
    data: {
      comment: newComment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const commnet = await Comment.findByIdAndDelete(req.params.id);

  if (!commnet) {
    return next(new AppError("No commnet found with this ID", 404));
  }

  res.status(204).json({
    status: "seccess",
    message: "Seccessfully deleted",
  });
});
