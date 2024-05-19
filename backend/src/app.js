import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors()); // this method is used to enable CORS with middleware options
app.use(
  express.json({
    limit: "16kb",
  })
); // this method is used to recognize the incoming Request Object as a JSON Object
// sunmiting form data

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // this method is used to recognize the incoming Request Object as strings or arrays
// it is used to convert space into recognisable characters

app.use(express.static("public")); // this method is used to serve static files

app.use(cookieParser()); // this method is used to parse Cookie header and populate req.cookies with an object keyed by the cookie names

// routes importing

import userRouter from "./routes/user.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import reviewRouter from "./routes/reviews.routes.js";
import bookingRouter from "./routes/bookings.routes.js";

app.use("/api/v1/users", userRouter); // this method is used to mount the specified middleware function(s) at the path which is being called
// url will be https://localhost:8000/api/v1/users/register

app.use("/api/v1/hotels", hotelRouter); // this method is used to mount the specified middleware function(s) at the path which is being called

app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
export default app;
