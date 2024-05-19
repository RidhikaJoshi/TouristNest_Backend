import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  register,
  loginUser,
  logout,
  changeFullnamePhoneNumber,
  changeCurrentPassword,
  changeProfilePicture,
  refreshAccessToken,
  getUserProfile,
  getCurrentlyLoggedInUser,
  getUserById,
} from "../controllers/user.controller.js"; // this method is used to import the register function from the user.controller.js file

const router = Router(); // this method is used to create a new router object

router.route("/register").post(upload.single("profilePicture"), register); // this method is used to create a new route that will accept the POST request at the /register endpoint
// calling multer function to upload single file and calling register function

router.route("").get(verifyJWT, getCurrentlyLoggedInUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logout);
router
  .route("/changeFullnamePhoneNumber")
  .patch(verifyJWT, changeFullnamePhoneNumber);

router.route("/:userId").get(getUserById);

router.route("/changeCurrentPassword").patch(verifyJWT, changeCurrentPassword);
router
  .route("/changeProfilePicture")
  .patch(verifyJWT, upload.single("profilePicture"), changeProfilePicture);

router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/getUserProfile/:username").get(verifyJWT, getUserProfile);

export default router; // this method is used to export the router object
// Path: backend/src/routes/user.routes.js
