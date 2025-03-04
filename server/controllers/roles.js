const rolesModel = require("../models/roles");
const rolesValidation = require("../validation/rolesValidation.js");

/* Add roles */
const Add = async (req, res) => {
  const { errors, isValid } = rolesValidation(req.body);
  try {
    if (!isValid) {
<<<<<<< HEAD
      return res.status(400).json(errors);
    }

    const { name, permissions } = req.body;

    const newRole = await rolesModel.create({ name, permissions });
    return res.status(201).json({
      success: true,
      data: newRole,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

/* Get all roles */
const GetAll = async (req, res) => {
  try {
    const roles = await rolesModel.find();
    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* Get one role */
const GetOne = async (req, res) => {
  try {
    const role = await rolesModel.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* Update role */
=======
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
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
const UpdateOne = async (req, res) => {
  const { errors, isValid } = rolesValidation(req.body);
  try {
    if (!isValid) {
<<<<<<< HEAD
      return res.status(400).json(errors);
    }

    const { name, permissions } = req.body;

    const updatedRole = await rolesModel.findOneAndUpdate(
      { _id: req.params.id },
      { name, permissions },
      { new: true }
    );

    return res.status(200).json({
      success: "updated",
      data: updatedRole,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* Delete role */
const DeleteOne = async (req, res) => {
  try {
    const deletedRole = await rolesModel.findByIdAndDelete(req.params.id);
    
    if (!deletedRole) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
      data: deletedRole,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { Add, GetAll, GetOne, UpdateOne, DeleteOne };
=======
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
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
