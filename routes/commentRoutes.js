const express = require("express");
const commentController = require("./../controllers/commentController");
const authController = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(commentController.getAllComments)
  .post(authController.protect, commentController.createComment);

router
  .route("/:id")
  // .get(commnetController.getcommnet)
  // .patch(
  //   authController.protect,
  //   authController.restrictTo("admin", "artist"),
  //   commnetController.updatecommnet
  // )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    commentController.deleteComment
  );

module.exports = router;
