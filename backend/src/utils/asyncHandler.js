const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}; // higher order function
// that can receive a function and return a new function
// funct received as a parameter is passes into another async function

/*
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; // higher order function
*/
// another way of writing the same function

export { asyncHandler };
