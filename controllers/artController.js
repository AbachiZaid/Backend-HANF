const AppError = require("../utilities/appError");
const Art = require("./../models/artModel");
const multer = require("multer");
const APIFeatures = require("./../utilities/apiFeatures");
const catchAsync = require("./../utilities/catchAsync.js");

// // Image storage
const multerImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, "public/audioImg");
    } else {
      cb(null, "public/media/audio");
    }
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `audio-${req.user.id}-${Date.now()}.${ext}`);
  },
});

//const multerStorage = multer.memoryStorage();

const multerImageFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("not an Image! Please upload only images.", 400), false);
    }
  } else {
    if (file.mimetype.startsWith("audio")) {
      cb(null, true);
    } else {
      cb(new AppError("not an Image! Please upload only audio.", 400), false);
    }
  }
};

const uploadImage = multer({
  storage: multerImageStorage,
  fileFilter: multerImageFilter,
});

exports.uploadSongInfo = uploadImage.fields([
  {
    name: "audio",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
]);

exports.trendingSongs = (req, res, next) => {
  req.query.limit = "4";
  req.query.sort = "-createdAt,price";
  req.query.fields = "title,musicArt,price,image,audio,createdAt";
  next();
};

exports.getAllArts = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.userId) filter = { user: req.params.userId };

  // EXECUTE QUERY
  const features = new APIFeatures(Art.find(filter), req.query)
    .filter()
    .sort("-createdAt")
    .limitFields()
    .paginate();
  const arts = await features.query;

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      arts,
    },
  });
});

exports.createArt = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.art) req.body.art = req.params.artId;
  if (!req.body.user) req.body.user = req.user.id;

  if (req.files) req.body.audio = req.files.audio[0].path;
  if (req.files) req.body.image = req.files.image[0].path;

  console.log(req.file);
  console.log(req.body);

  const art = await Art.create(req.body);
  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      art,
    },
  });
});

exports.getArt = catchAsync(async (req, res, next) => {
  const art = await Art.findById(req.params.id);

  if (!art) {
    return next(new AppError("No art found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      art,
    },
  });
});

exports.updateArt = catchAsync(async (req, res, next) => {
  if (req.files.audio) req.body.audio = req.files.audio[0].path;
  if (req.files.image) req.body.image = req.files.image[0].path;

  // console.log(req.file);
  // console.log(req.body);

  const art = await Art.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!art) {
    return next(new AppError("No art found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      art,
    },
  });
});

exports.deleteArt = catchAsync(async (req, res, next) => {
  const art = await Art.findByIdAndDelete(req.params.id);

  if (!art) {
    return next(new AppError("No art found with this ID", 404));
  }

  res.status(204).json({
    status: "seccess",
    message: "Seccessfully deleted",
  });
});
