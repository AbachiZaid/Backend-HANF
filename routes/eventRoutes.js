const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("./../controllers/authController");
const router = express.Router();

router
  .route("/trending-events")
  .get(eventController.trendingEvents, eventController.getAllEvents);

router
  .route("/")
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    eventController.uploadEventImage,
    eventController.createEvent
  );

router
  .route("/:id")
  .get(eventController.getEvent)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    eventController.uploadEventImage,
    eventController.updateEvent
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    eventController.deleteEvent
  );

module.exports = router;
