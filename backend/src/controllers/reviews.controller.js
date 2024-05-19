import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/reviews.model.js";
import { isValidObjectId } from "mongoose";

const getHotelReviews = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  //console.log(hotelId);
  const { page = 1, limit = 10 } = req.query;
  const skipper = (page - 1) * limit;
  if (!hotelId) {
    throw new ApiError(400, "Hotel ID is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }
  const AllReviews = await Review.find({ hotel: hotelId })
    .skip(skipper)
    .limit(limit);
  if (!AllReviews) {
    throw new ApiError(404, "No reviews found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, AllReviews, "Reviews fetched successfully"));
});

const addReviews = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) {
    throw new ApiError(400, "Hotel ID is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }
  const { content, rating } = req.body;
  if (!content || !rating) {
    throw new ApiError(400, "Content and rating are required");
  }
  const newReview = await Review.create({
    content,
    rating,
    hotel: hotelId,
    user: req.user._id,
  });
  if (!newReview) {
    throw new ApiError(400, "Review not created");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newReview, "Review created successfully"));
});

const updateReviews = asyncHandler(async (req, res) => {
  const { hotelId, reviewId } = req.params;
  if (!hotelId || !reviewId) {
    throw new ApiError(400, "Hotel ID and Review ID are required");
  }
  if (!isValidObjectId(hotelId) || !isValidObjectId(reviewId)) {
    throw new ApiError(400, "Invalid hotel ID or review ID");
  }
  const { content, rating } = req.body;
  if (!content || !rating) {
    throw new ApiError(400, "Content and rating are required");
  }
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    {
      $set: {
        content,
        rating,
      },
    },
    { new: true }
  );
  if (!updatedReview) {
    throw new ApiError(400, "Review not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReview, "Review updated successfully"));
});

const deleteReviews = asyncHandler(async (req, res) => {
  const { hotelId, reviewId } = req.params;
  if (!hotelId || !reviewId) {
    throw new ApiError(400, "Hotel ID and Review ID are required");
  }
  if (!isValidObjectId(hotelId) || !isValidObjectId(reviewId)) {
    throw new ApiError(400, "Invalid hotel ID or review ID");
  }
  const deletedReview = await Review.findByIdAndDelete(reviewId);
  if (!deletedReview) {
    throw new ApiError(400, "Review not deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export { getHotelReviews, addReviews, updateReviews, deleteReviews };
// This method is used to export the getHotelComments, addComment, updateComment, and deleteComment functions
