const usersModel = require("../models/users");
const profileValidation = require("../validation/profileValidation");

// GetAll users
exports.GetAll = async (req, res) => {
  try {
    const data = await usersModel.find();
    res.status(200).json({
      length: data.length,
      data: data,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// GetOne user
exports.GetOne = async (req, res) => {
  try {
    const data = await usersModel.findOne({ _id: req.params.id });
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// UpdateOne user
exports.UpdateOne = async (req, res) => {
  try {
    const data = await usersModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json({
      success: "updated",
      data,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// UpdateProfile
exports.UpdateProfile = async (req, res) => {
  try {
    console.log('Update Profile Request:', req.body);
    console.log('User ID:', req.user.id);

    // Validate input if needed
    const { errors, isValid } = profileValidation(req.body);
    
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Find and update user
    const updatedUser = await usersModel.findOneAndUpdate(
      { _id: req.user.id },
      req.body,
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive information
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ 
      message: 'Server error occurred',
      error: error.message 
    });
  }
};

// DeleteOne user
exports.DeleteOne = async (req, res) => {
  try {
    await usersModel.deleteOne({ _id: req.params.id });
    res.status(201).json({
      message: "deleted",
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Additional methods if needed
exports.UpdateRole = async (req, res) => {
  try {
    const data = await usersModel.updateOne(
      { _id: req.params.id },
      { $push: { roles: req.body.role } }
    );
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.DeleteRole = async (req, res) => {
  try {
    const data = await usersModel.updateOne(
      { _id: req.params.id },
      { $pull: { roles: req.body.role } }
    );
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};