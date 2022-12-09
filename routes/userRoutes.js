const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const postRouter = require("./../routes/postRoutes");
const artRouter = require("./../routes/artRoutes");

const router = express.Router();

router
  .route("/top-users")
  .get(userController.topUsers, userController.getAllUsers);

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  //userController.resizeUserPhoto,
  userController.updateMe
);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.delete("/deleteMe", authController.protect, userController.deleteMe);

router
  .route("/")
  .get(authController.protect, userController.getAllUsers)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    userController.createUser
  );

router
  .route("/:id")
  .get(userController.getUser)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    userController.uploadUserPhoto,
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "artist"),
    userController.deleteUser
  );

router.use("/:userId/posts", postRouter);
router.use("/:userId/arts", artRouter);

module.exports = router;
