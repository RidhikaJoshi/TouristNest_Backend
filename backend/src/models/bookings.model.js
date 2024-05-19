import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    hotelName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    NumberOfRooms: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // paymentInfo: {
    //   id: {
    //     type: String,
    //     required: true,
    //   },
    //   status: {
    //     type: String,
    //     required: true,
    //   },
    // },
    // paidAt: {
    //   type: Date,
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
// This is the model for the booking schema
// This model is used to create a new booking document
