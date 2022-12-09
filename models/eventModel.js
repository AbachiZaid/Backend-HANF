const mongoose = require("mongoose");
const validator = require("validator");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please tell your event title"],
    trim: true,
    minLength: [2, "An event title must have more or equal than 2 Characters"],
  },

  subTitle: {
    type: String,
    required: [true, "Please tell the subTitle your event"],
    trim: true,
  },

  image: String,

  event: {
    type: String,
    require: [true, "Please tell your event"],
  },

  strasseUndHauseNummer: {
    type: String,
    require: [true, "Please tell Your address"],
  },

  plz: {
    type: String,
    require: [true, "Please tell plz"],
  },

  ort: {
    type: String,
    require: [true, "Please tell plz"],
  },
  telefon: {
    type: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  date: [Date()],

  uhrZeit: {
    type: String,
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
