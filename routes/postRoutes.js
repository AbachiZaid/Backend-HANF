const express = require("express");
const postController = require("./../controllers/postController");
const authController = require("./../controllers/authController");
const commentRouter = require("./../routes/commentRoutes");

const router = express.Router({ mergeParams: true });

router
  .route("/trending-posts")
  .get(postController.trendingPosts, postController.getAllPosts);

router.route("/").get(postController.getAllPosts).post(
  authController.protect,
  authController.restrictTo("admin", "artist"),
  postController.uploadPostPhoto,
  //postController.resizePostPhoto,
  postController.createPost
);

router
  .route("/:id")
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    postController.uploadPostPhoto,
    //postController.resizePostPhoto,
    postController.updatePost
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    postController.deletePost
  );

router.use("/:postId/comments", commentRouter);

module.exports = router;
