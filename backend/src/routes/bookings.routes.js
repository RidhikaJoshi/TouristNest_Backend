import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createNewBooking,
  getBookingById,
  deleteBookingById,
  updateBookingById,
  getAllBookings,
} from "../controllers/bookings.controller.js";

const router = Router(); // this method is used to create a new router object

router.route("/:hotelId").post(verifyJWT, createNewBooking); // this method is used to create a new route that will accept the POST request at the /booking/:hotelId endpoint

router.route("/allBookings").get(verifyJWT, getAllBookings); // this method is used to create a new route that will accept the GET request at the /booking endpoint
router
  .route("/:bookingId")
  .get(verifyJWT, getBookingById)
  .patch(verifyJWT, updateBookingById)
  .delete(verifyJWT, deleteBookingById); // this method is used to create a new route that will accept the GET request at the /booking/:bookingId endpoint
export default router; // this method is used to export the router object
