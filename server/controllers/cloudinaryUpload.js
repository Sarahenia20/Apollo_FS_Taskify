// controllers/cloudinaryUpload.js
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

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_images",
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
      const userId = req.user._id;
      console.log("Looking for user with ID:", userId);
      
      const user = await User.findById(userId);
      if (!user) {
        console.warn("User not found");
        return res.status(404).json({ picture: "User not found" });
      }
      
      console.log("Image successfully uploaded to Cloudinary:", req.file.path);
      user.picture = req.file.path;
      await user.save();
      
      console.log("Profile updated successfully!");
      res.status(200).send({
        status: "success",
        data: user,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = {
  Upload
};