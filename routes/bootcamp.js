const express = require("express");

const {
  getbootCamps,
  postbootCamp,
  getbootCamp,
  updatebootCamp,
  deletebootCamp,
  getbootcampsInRadius,
  uploadBootcampPhoto,
} = require("./controller/bootcamp.js");
const { protect, authorize } = require("../middleware/auth.js");

//Include other resourse router
const courseRouter = require("./courses");
const reviewRouter = require("./review");
const Router = express.Router();

//Re-direct router to course router
Router.use("/:bootcampId/courses", courseRouter);
Router.use("/:bootcampId/reviews", reviewRouter);

//Route for photo upload
Router.route("/:id/photo").put(
  protect,
  authorize("admin", "publisher"),
  uploadBootcampPhoto
);

//Router to bootcamp controller
Router.route("/radius/:zipcode/:distance").get(getbootcampsInRadius);
Router.route("/")
  .get(getbootCamps)
  .post(protect, authorize("admin", "publisher"), postbootCamp);

Router.route("/:id")
  .get(getbootCamp)
  .put(protect, authorize("publisher", "admin"), updatebootCamp)
  .delete(protect, authorize("publisher", "admin"), deletebootCamp);

module.exports = Router;
