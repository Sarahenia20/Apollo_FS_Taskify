const rolesModel = require("../models/roles");
const rolesValidation = require("../validation/rolesValidation.js");

/* Add roles */
const Add = async (req, res) => {
  const { errors, isValid } = rolesValidation(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
      const data = await rolesModel.create(req.body);
      res.status(201).json({
        success: true,
        data: data,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

/* GetAll roles */
const GetAll = async (req, res) => {
  try {
    const data = await rolesModel.find();
    res.status(200).json({
      length: data.length,
      data: data,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* GetOne roles */
const GetOne = async (req, res) => {
  try {
    const data = await rolesModel.findOne({ _id: req.params.id });
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* UpdateOne roles */
const UpdateOne = async (req, res) => {
  const { errors, isValid } = rolesValidation(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
      const data = await rolesModel.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      res.status(200).json({
        success: "updated",
        data,
      });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* DeleteOne roles */
const DeleteOne = async (req, res) => {
  try {
    await rolesModel.deleteOne({ _id: req.params.id });
    res.status(201).json({
      message: "deleted",
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  Add,
  GetAll,
  GetOne,
  UpdateOne,
  DeleteOne,
};
// controllers/roles.js
/*const rolesModel = require("../models/roles");
const rolesValidation = require("../validation/rolesValidation.js");

/* Add roles */
/*const Add = async (req, res) => {
  const { errors, isValid } = rolesValidation(req.body);
  try {
    if (!isValid) {
      return res.status(400).json(errors);
    } else {
      // Check if a role with the same title already exists
      const existingRole = await rolesModel.findOne({ title: req.body.title });
      if (existingRole) {
        return res.status(400).json({ title: "Role with this title already exists" });
      }

      // Create new role
      const data = await rolesModel.create(req.body);
      res.status(201).json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

/* GetAll roles */
/*const GetAll = async (req, res) => {
  try {
    const data = await rolesModel.find().sort({ title: 1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GetOne roles */
/*const GetOne = async (req, res) => {
  try {
    const data = await rolesModel.findOne({ _id: req.params.id });
    if (!data) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* UpdateOne roles */
/*const UpdateOne = async (req, res) => {
  const { errors, isValid } = rolesValidation(req.body);
  try {
    if (!isValid) {
      return res.status(400).json(errors);
    } else {
      // Check if the role exists
      const role = await rolesModel.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Check if trying to update to a title that already exists
      if (req.body.title && req.body.title !== role.title) {
        const existingRole = await rolesModel.findOne({ title: req.body.title });
        if (existingRole) {
          return res.status(400).json({ title: "Role with this title already exists" });
        }
      }

      // Update the role
      const data = await rolesModel.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DeleteOne roles */
/*const DeleteOne = async (req, res) => {
  try {
    const role = await rolesModel.findById(req.params.id);
    
    // Check if role exists
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    
    // Don't allow deletion of default roles
    if (role.isDefault) {
      return res.status(400).json({ error: "Cannot delete default system roles" });
    }
    
    await rolesModel.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: "Role deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Generate Description For a Role Name */
/*const GenerateDescription = async (req, res) => {
  try {
    const { roleName } = req.body;
    
    if (!roleName || typeof roleName !== 'string') {
      return res.status(400).json({ error: "Role name is required" });
    }
    
    // Map of common role descriptions
    const roleDescriptions = {
      "project manager": "Responsible for planning, executing, and closing projects. Oversees team members, manages schedules, and ensures projects are completed on time and within budget.",
      "product manager": "Responsible for the product throughout its lifecycle. Defines the product vision, gathers requirements, and works with development teams to deliver user value.",
      "developer": "Responsible for writing, testing, and maintaining code. Works on software features and fixes bugs.",
      "admin": "Has full system access and manages system settings, user accounts, and overall platform configuration.",
      "team lead": "Manages a team of developers or other staff members. Provides technical guidance and ensures team productivity.",
      "qa tester": "Responsible for testing software, identifying bugs, and ensuring quality standards are met.",
      "product owner": "Represents stakeholders and is responsible for maximizing the value of the product by creating and managing the product backlog.",
      "scrum master": "Facilitates Scrum processes and removes impediments for the development team."
    };
    
    const lowercaseName = roleName.toLowerCase();
    
    // Return the matching description or a generic one
    const description = roleDescriptions[lowercaseName] 
      ? roleDescriptions[lowercaseName]
      : `Responsible for ${lowercaseName} related activities in the system.`;
    
    res.status(200).json({ description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  Add,
  GetAll,
  GetOne,
  UpdateOne,
  DeleteOne,
  GenerateDescription
};*/
