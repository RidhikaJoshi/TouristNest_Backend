import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotels.model.js";
import { Booking } from "../models/bookings.model.js";
import { isValidObjectId } from "mongoose";

const createNewBooking = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) {
    throw new ApiError(400, "hotelId is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotelId");
  }
  const { checkinDate, checkoutDate, NumberOfRooms } = req.body;
  if (!checkinDate || !checkoutDate || !NumberOfRooms) {
    throw new ApiError(400, "checkIn, checkOut, NumberOfRooms are required");
  }
  const checkIn = new Date(checkinDate);
  const checkOut = new Date(checkoutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }

  if (checkIn >= checkOut) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }
  const price = hotel.price;
  const hotelName = hotel.name;
  const numberOfNights = Math.ceil(
    (checkOut - checkIn) / (1000 * 60 * 60 * 24)
  );

  const totalAmount = price * NumberOfRooms * numberOfNights;

  const newBooking = await Booking.create({
    hotel: hotelId,
    hotelName,
    user: req.user._id,
    checkIn,
    checkOut,
    NumberOfRooms,
    totalAmount,
  });
  if (!newBooking) {
    throw new ApiError(500, "Booking failed");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "Booking successful", newBooking));
});

const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!bookingId) {
    throw new ApiError(400, "bookingId is required");
  }
  if (!isValidObjectId(bookingId)) {
    throw new ApiError(400, "Invalid bookingId");
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  return res.status(200).json(new ApiResponse(200, booking, "Booking found"));
});

const getAllBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }
  const bookings = await Booking.find({ user: userId });
  if (!bookings) {
    throw new ApiError(404, "No bookings found");
  }
  return res.status(200).json(new ApiResponse(200, bookings, "Bookings found"));
});

const updateBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!bookingId) {
    throw new ApiError(400, "bookingId is required");
  }
  if (!isValidObjectId(bookingId)) {
    throw new ApiError(400, "Invalid bookingId");
  }
  const { checkinDate, checkoutDate, NumberOfRooms } = req.body;
  if (!checkinDate || !checkoutDate || !NumberOfRooms) {
    throw new ApiError(400, "checkIn, checkOut, NumberOfRooms are required");
  }
  const checkIn = new Date(checkinDate);
  const checkOut = new Date(checkoutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }

  if (checkIn >= checkOut) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }
  const book = await Booking.findById(bookingId);
  if (!book) {
    throw new ApiError(404, "Booking not found");
  }
  const hotel = await Hotel.findById(book.hotel);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }
  const price = hotel.price;
  const numberOfNights = Math.ceil(
    (checkOut - checkIn) / (1000 * 60 * 60 * 24)
  );

  const totalAmount = price * NumberOfRooms * numberOfNights;
  const updateBooking = await Booking.findByIdAndUpdate(bookingId, {
    $set: {
      checkIn,
      checkOut,
      NumberOfRooms: NumberOfRooms,
      totalAmount: totalAmount,
    },
  });
  if (!updateBooking) {
    throw new ApiError(500, "Booking update failed");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateBooking, "Booking updated"));
});

const deleteBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!bookingId) {
    throw new ApiError(400, "bookingId is required");
  }
  if (!isValidObjectId(bookingId)) {
    throw new ApiError(400, "Invalid bookingId");
  }
  const booking = await Booking.findByIdAndDelete(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Booking deleted"));
});

export {
  createNewBooking,
  getBookingById,
  getAllBookings,
  updateBookingById,
  deleteBookingById,
};
