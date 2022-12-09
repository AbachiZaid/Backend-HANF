const User = require("./../models/userModel");
const multer = require("multer");
const APIFeatures = require("./../utilities/apiFeatures");
const catchAsync = require("./../utilities/catchAsync");
const AppError = require("../utilities/appError");

// User Image Upload

// Image Storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
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

exports.uploadUserPhoto = upload.single("photo");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.topUsers = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-createdAt";
  req.query.fields = "photo, firstname, surname";
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        404
      )
    );
  }
  // 2) Filtered out fields names that are not allowed to be updated
  // console.log(req.file);
  // console.log(req.body);
  const filterBody = filterObj(
    req.body,
    "firstname",
    "surename",
    "email",
    "aboutMe",
    "myProjects"
  );
  if (req.file) filterBody.photo = req.file.path;
  // 3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "seccess",
    data: {
      updateUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "seccess",
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort("-createdAt")
    .limitFields()
    .paginate();
  const users = await features.query;
  res.status(200).json({
    status: "seccess",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  if (req.file) req.body.photo = req.file.path;
  const user = await User.create(req.body);
  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate("posts");

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.file) req.body.photo = req.file.path;
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  res.status(204).json({
    status: "seccess",
    message: "Seccessfully deleted",
  });
});
