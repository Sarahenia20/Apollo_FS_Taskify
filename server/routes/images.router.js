// routes/images.router.js
const express = require("express");
const Router = express.Router();
const passport = require("passport");
const cloudinaryController = require("../controllers/cloudinaryUpload");

// Test route to check Cloudinary connectivity
Router.get(
  "/test-cloudinary",
  cloudinaryController.testCloudinary
);

// Image upload route - Apply middleware correctly
Router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  cloudinaryController.uploadMiddleware,  // Apply multer middleware first
  cloudinaryController.uploadHandler      // Then handle the upload
);

module.exports = Router;