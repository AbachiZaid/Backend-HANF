const Event = require("./../models/eventModel");
const APIFeatures = require("./../utilities/apiFeatures");
const multer = require("multer");
const catchAsync = require("./../utilities/catchAsync");
const AppError = require("../utilities/appError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/events");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `event-${req.user.id}-${Date.now()}.${ext}`);
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

exports.uploadEventImage = upload.single("image");

//////////

exports.trendingEvents = (req, res, next) => {
  req.query.limit = "2";
  req.query.sort = "-createdAt,price";
  req.query.fields = "title,description";
  next();
};

exports.getAllEvents = catchAsync(async (req, res, next) => {
  // EXECUTE THE QUERY
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort("-createdAt")
    .limitFields()
    .paginate();
  const events = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      events,
    },
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  if (req.file) req.body.image = req.file.path;
  const event = await Event.create(req.body);
  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      event,
    },
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("No event found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      event,
    },
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  if (req.file) req.body.image = req.file.path;
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return next(new AppError("No event found with this ID", 404));
  }

  res.status(200).json({
    status: "seccess",
    message: "",
    data: {
      event,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError("No event found with this ID", 404));
  }

  res.status(204).json({
    status: "seccess",
    message: "Seccessfully deleted",
  });
});
