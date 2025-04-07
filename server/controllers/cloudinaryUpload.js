// controllers/cloudinaryUpload.js - FIXED VERSION
const User = require("../models/users");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dtn7sr0k5",
  api_key: process.env.CLOUDINARY_API_KEY || "218928741933615",
  api_secret: process.env.CLOUDINARY_API_SECRET || "4Q5w13NQb8CBjfSfgosna0QR7ao",
});

<<<<<<< HEAD
<<<<<<< Updated upstream
// Cloudinary storage configuration
=======
// Create Cloudinary storage
>>>>>>> Stashed changes
=======
// Debug Cloudinary configuration
console.log("Cloudinary config initialized with cloud name:", process.env.CLOUDINARY_CLOUD_NAME || "dtn7sr0k5");

// Create Cloudinary storage
>>>>>>> c54add06db9787684cdcab2c38cb239831e451d0
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_images",
<<<<<<< HEAD
<<<<<<< Updated upstream
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
=======
    allowed_formats: ['jpg', 'jpeg', 'png'], // Be more specific about allowed formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Add image optimization
>>>>>>> c54add06db9787684cdcab2c38cb239831e451d0
  },
});

// Create the multer upload middleware
const uploadMiddleware = multer({ storage: storage });

// Export the Upload function
const Upload = (req, res) => {
  console.log("Request received for image upload");
  
  // Use the middleware directly here
  uploadMiddleware.single("picture")(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ picture: "Upload failed: " + err.message });
    }
    
    if (!req.file) {
      console.warn("No image received");
      return res.status(400).json({ picture: "No image provided" });
    }
    
    try {
<<<<<<< HEAD
=======
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// Create the multer upload middleware OUTSIDE the route handler
const upload = multer({ storage: storage });

// Export both the middleware and the handler separately
module.exports = {
  uploadMiddleware: upload.single("picture"),
  
  // This will now be called AFTER the middleware has processed the request
  uploadHandler: async (req, res) => {
    console.log("Image upload processing");
    
    try {
      // The middleware already ran, so we can check if there's a file
      if (!req.file) {
        console.warn("No image received");
        return res.status(400).json({ picture: "No image provided" });
      }
      
      // Check if user ID is available in the request
      if (!req.user || !req.user._id) {
        console.error("User ID not found in request");
        return res.status(401).json({ picture: "Authentication required" });
      }
      
>>>>>>> Stashed changes
=======
      // Check if user ID is available in the request
      if (!req.user || !req.user._id) {
        console.error("User ID not found in request. Auth middleware issue?");
        console.log("Request user object:", req.user);
        return res.status(401).json({ picture: "Authentication required" });
      }
      
>>>>>>> c54add06db9787684cdcab2c38cb239831e451d0
      const userId = req.user._id;
      console.log("Updating user with ID:", userId);
      
      const user = await User.findById(userId);
      if (!user) {
        console.warn("User not found");
        return res.status(404).json({ picture: "User not found" });
      }
      
<<<<<<< HEAD
<<<<<<< Updated upstream
      console.log("Image successfully uploaded to Cloudinary:", req.file.path);
      user.picture = req.file.path;
=======
      // Get the secure URL from Cloudinary
      const imageUrl = req.file.path || req.file.secure_url;
      console.log("Cloudinary image URL:", imageUrl);
      
      // Update user profile with new image
      user.picture = imageUrl;
>>>>>>> Stashed changes
=======
      // The path to the uploaded image is in req.file.path
      console.log("Full file details:", req.file);
      
      // Store the secure URL from Cloudinary
      user.picture = req.file.path || req.file.secure_url;
>>>>>>> c54add06db9787684cdcab2c38cb239831e451d0
      await user.save();
      
      console.log("Profile updated successfully!");
      return res.status(200).json({
        status: "success",
<<<<<<< HEAD
        data: user,
<<<<<<< Updated upstream
=======
        data: {
          user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            picture: user.picture
          }
        },
        message: "Profile picture updated successfully"
>>>>>>> c54add06db9787684cdcab2c38cb239831e451d0
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};

// Create a test function to verify Cloudinary connectivity
const TestCloudinary = (req, res) => {
  cloudinary.uploader.upload(
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    { public_id: "test_connection" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary test error:", error);
        return res.status(500).json({ 
          status: "error", 
          message: "Cloudinary connection failed", 
          error: error 
        });
      }
      
      console.log("Cloudinary test success:", result);
      return res.status(200).json({ 
        status: "success", 
        message: "Cloudinary connection successful", 
        result: result 
      });
    }
  );
};

module.exports = {
<<<<<<< HEAD
  Upload
=======
        message: "Profile picture updated successfully"
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ 
        status: "error", 
        message: "Failed to update profile picture",
        error: error.message 
      });
    }
  },
  
  // Test Cloudinary connectivity
  testCloudinary: (req, res) => {
    cloudinary.uploader.upload(
      "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
      { public_id: "test_connection" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary test error:", error);
          return res.status(500).json({
            status: "error",
            message: "Cloudinary connection failed",
            error: error
          });
        }
        
        console.log("Cloudinary test success:", result);
        return res.status(200).json({
          status: "success",
          message: "Cloudinary connection successful",
          result: result
        });
      }
    );
  }
>>>>>>> Stashed changes
=======
  Upload,
  TestCloudinary
>>>>>>> c54add06db9787684cdcab2c38cb239831e451d0
};