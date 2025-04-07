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

<<<<<<< Updated upstream
// Cloudinary storage configuration
=======
// Create Cloudinary storage
>>>>>>> Stashed changes
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_images",
<<<<<<< Updated upstream
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage }).single("picture");

// Export the Upload function
const Upload = (req, res) => {
  console.log("Request received for image upload");
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ picture: "Upload failed: " + err.message });
    }
    
    if (!req.file) {
      console.warn("No image received");
      return res.status(400).json({ picture: "No image provided" });
    }
    
    try {
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
      const userId = req.user._id;
      console.log("Updating user with ID:", userId);
      
      const user = await User.findById(userId);
      if (!user) {
        console.warn("User not found");
        return res.status(404).json({ picture: "User not found" });
      }
      
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
      await user.save();
      
      console.log("Profile updated successfully!");
      return res.status(200).json({
        status: "success",
        data: user,
<<<<<<< Updated upstream
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = {
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
};