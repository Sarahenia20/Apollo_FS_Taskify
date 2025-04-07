const ProjectModel = require("../models/projet");

/* Add Project */
const Add = async (req, res) => {
  try {
    const project = await ProjectModel.create(req.body);
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* GetAll Projects */
const GetAll = async (req, res) => {
  try {
    const projects = await ProjectModel.find();
    res.status(200).json({
      length: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* GetOne Project */
const GetOne = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    res.status(200).json(project);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* UpdateOne Project */
const UpdateOne = async (req, res) => {
  try {
    const project = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/* DeleteOne Project */
const DeleteOne = async (req, res) => {
  try {
    await ProjectModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
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