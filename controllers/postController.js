const Post = require("./../models/postModel");
const multer = require("multer");
const APIFeatures = require("./../utilities/apiFeatures");
const catchAsync = require("./../utilities/catchAsync");
const AppError = require("../utilities/appError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/posts");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `post-${req.user.id}-${Date.now()}.${ext}`);
  },

  fileFilter: (req, file, cd) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("not an Image! Please upload only images.", 400), false);
    }
  },
});

//const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an Image! Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPostPhoto = upload.single("image");

exports.trendingPosts = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-createdAt";
  req.query.fields = "post,image";
  next();
};

//.populate("comments")
exports.getAllPosts = catchAsync(async (req, res, next) => {
  // EXECUTE THE QUERY

  let filter = {};
  if (req.params.userId) filter = { user: req.params.userId };

  const features = new APIFeatures(Post.find(filter), req.query)
    .filter()
    .sort("-createdAt")
    .limitFields()
    .paginate();
  const posts = await features.query.populate("comments");

  // SEND RESPONSE
  res.status(200).json({
    status: "seccess",
    message: "Fetching data",
    data: {
      posts,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  if (req.file) req.body.image = req.file.path;

  // Allow nested routes
  if (!req.body.user) req.body.user = req.params.userId;
  if (!req.body.post) req.body.post = req.post.id;

  const post = await Post.create(req.body);
  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      post,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("No post found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      post,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  if (req.file) req.body.image = req.file.path;
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return next(new AppError("No post found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return next(new AppError("No post found with this ID", 404));
  }

  res.status(204).json({
    status: "seccess",
    message: "Seccessfully deleted",
  });
});
