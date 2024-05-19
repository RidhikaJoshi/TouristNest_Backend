import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getHotelReviews,
  addReviews,
  updateReviews,
  deleteReviews,
} from "../controllers/reviews.controller.js";

const router = Router(); // this method is used to create a new router object

router.route("/:hotelId").get(getHotelReviews).post(verifyJWT, addReviews); // this method is used to create a new route that will accept the GET request at the /:hotelId endpoint
router
  .route("/:hotelId/:reviewId")
  .patch(verifyJWT, updateReviews)
  .delete(verifyJWT, deleteReviews); // this method is used to create a new route that will accept the PATCH request at the /:hotelId/:commentId endpoint
export default router; // this method is used to export the router object
// Path: backend/src/routes/reviews.routes.js
