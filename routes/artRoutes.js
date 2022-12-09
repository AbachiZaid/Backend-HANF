const express = require("express");
const artController = require("../controllers/artController");
const authController = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/trending-songs")
  .get(artController.trendingSongs, artController.getAllArts);

router.route("/").get(artController.getAllArts).post(
  authController.protect,
  authController.restrictTo("admin", "artist"),
  // artController.uploadAudio,
  artController.uploadSongInfo,
  artController.createArt
);

router
  .route("/:id")
  .get(artController.getArt)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    artController.uploadSongInfo,
    artController.updateArt
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    artController.deleteArt
  );

module.exports = router;
