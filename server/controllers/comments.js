const tasksModel = require("../models/tasks");
const cloudinary = require("cloudinary").v2;

// Use your existing Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dtn7sr0k5",
  api_key: process.env.CLOUDINARY_API_KEY || "218928741933615",
  api_secret: process.env.CLOUDINARY_API_SECRET || "4Q5w13NQb8CBjfSfgosna0QR7ao",
});

const AddComment = async (req, res) => {
  try {
    if (!req.body.comment) {
      return res.status(404).json({ comment: "Required comment" });
    }
    
    let imageUrl = null;
    
    // Handle file upload if provided
    if (req.body.file && req.body.file.trim() !== '') {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${req.body.file}`,
          {
            folder: "comment_images"
          }
        );
        
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Continue with comment creation even if image upload fails
      }
    }
    
    const data = await tasksModel.updateOne(
      { _id: req.params.id },
      {
        $push: {
          comments: {
            content: req.body.comment,
            by: req.user.id,
            image: imageUrl
          },
        },
      }
    );
    
    return res.status(201).send({
      status: "success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
const UpdateComment = async (req, res) => {
  try {
    if (!req.body.comment) {
      return res.status(404).json({ comment: "Required comment" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const DeleteComment = async (req, res) => {
  try {
    const data = await tasksModel.updateOne(
      { _id: req.params.id },
      {
        $pull: {
          comments: {
            _id: req.params.c_id,
          },
        },
      }
    );
    return res.status(201).send({
      status: "success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  AddComment,
  UpdateComment,
  DeleteComment,
};