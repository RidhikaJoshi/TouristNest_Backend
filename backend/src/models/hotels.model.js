import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const hotelSchema = new mongoose.Schema(
  {
    picture: {
      type: String, //cloudinary url
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      enum: ["5 star", "4 star", "3 star", "2 star", "1 star"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
hotelSchema.plugin(mongooseAggregatePaginate);
export const Hotel = mongoose.model("Hotel", hotelSchema);
// This is the model for the hotel schema
// This model is used to create a new hotel document
