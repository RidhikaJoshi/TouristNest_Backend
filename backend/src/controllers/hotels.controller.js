import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Hotel } from "../models/hotels.model.js";
import { isValidObjectId } from "mongoose";

const getAllHotels = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skipper = (page - 1) * limit;

  const hotels = await Hotel.find({}).skip(skipper).limit(limit);
  if (!hotels) {
    throw new ApiError(404, "No hotels found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, hotels, "Hotels fetched successfully"));
});

const getHoteldetailsById = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) {
    throw new ApiError(400, "Hotel ID is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found in the database");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, hotel, "Hotel fetched successfully"));
});

const addHotels = asyncHandler(async (req, res) => {
  const { name, description, tags, price, country, state, location } = req.body;
  if (
    !name ||
    !description ||
    !tags ||
    !price ||
    !country ||
    !state ||
    !location
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const pictureLocalPath = req.file?.path;
  if (!pictureLocalPath) {
    throw new ApiError(400, "Picture is required");
  }
  const picture = await uploadOnCloudinary(pictureLocalPath);
  if (!picture) {
    throw new ApiError(500, "Failed to upload picture on cloudinary");
  }
  console.log("picture", picture);
  console.log("name", name);
  console.log("description", description);
  console.log("tags", tags);
  console.log("price", price);
  console.log("country", country);
  console.log("state", state);
  console.log("location", location);

  const newHotel = await Hotel.create({
    picture: picture.url,
    name,
    description,
    tags,
    price,
    country,
    state,
    location,
    owner: req.user._id,
  });
  if (!newHotel) {
    throw new ApiError(
      500,
      "Internal Server error occurred while creating new Hotel in the database"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newHotel, "Hotel added successfully"));
});

const updateHotelDetails = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) {
    throw new ApiError(400, "Hotel ID is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }
  const { name, describtion, tags, price, country, state, location } = req.body;
  if (
    !name &&
    !describtion &&
    !tags &&
    !price &&
    !country &&
    !state &&
    !location
  ) {
    throw new ApiError(400, "Atleast one field is required to update");
  }
  const hotel = await Hotel.findById(hotelId);
  const updatedHotels = await Hotel.findByIdAndUpdate(
    hotelId,
    {
      $set: {
        name: name ? name : hotel.name,
        describtion: describtion ? describtion : hotel.describtion,
        tags: tags ? tags : hotel.tags,
        price: price ? price : hotel.price,
        country: country ? country : hotel.country,
        state: state ? state : hotel.state,
        location: location ? location : hotel.location,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedHotels) {
    throw new ApiError(404, "Hotel not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedHotels, "Hotel details updated successfully")
    );
});

const updatedHotelsPicture = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) {
    throw new ApiError(400, "Hotel ID is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }
  const pictureLocalPath = req.file.path;
  if (!pictureLocalPath) {
    throw new ApiError(400, "Picture is required");
  }
  const picture = await uploadOnCloudinary(pictureLocalPath);
  if (!picture) {
    throw new ApiError(500, "Failed to upload picture on cloudinary");
  }
  const updatedHotels = await Hotel.findByIdAndUpdate(
    hotelId,
    {
      $set: {
        picture: picture.url,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedHotels) {
    throw new ApiError(404, "Hotel not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedHotels, "Hotel picture updated successfully")
    );
});

const deleteHotelById = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!hotelId) {
    throw new ApiError(400, "Hotel ID is required");
  }
  if (!isValidObjectId(hotelId)) {
    throw new ApiError(400, "Invalid hotel ID");
  }
  const hotel = await Hotel.findByIdAndDelete(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Hotel deleted successfully"));
});

export {
  addHotels,
  getAllHotels,
  updateHotelDetails,
  updatedHotelsPicture,
  getHoteldetailsById,
  deleteHotelById,
};
