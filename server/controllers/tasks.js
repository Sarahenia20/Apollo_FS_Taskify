const tasksModel = require("../models/tasks");
const socket = require("../socket");
const tasksValidation = require("../validation/tasksValidation");
const { addNotification } = require("./notifications");
const fs = require('fs').promises;
const path = require('path');

// Helper function to handle file deletion
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

// Transform request body for task creation/update
const transformTaskBody = (body) => {
  const transformedBody = { ...body };

  // Transform select fields if they are objects with value
  const fieldsToTransform = ['project', 'priority', 'status', 'type'];
  fieldsToTransform.forEach(field => {
    if (transformedBody[field] && transformedBody[field].value) {
      transformedBody[field] = transformedBody[field].value.toString();
    }
  });

  // Transform assigns if it's an array of objects
  if (Array.isArray(transformedBody.assigns)) {
    transformedBody.assigns = transformedBody.assigns.map(a => 
      a.value ? a.value : a
    );
  }

  return transformedBody;
};

/* Add tasks with file upload */
const Add = async (req, res) => {
  // Extensive logging for debugging
  console.log('=================== TASK CREATION DEBUG ===================');
  console.log('Raw Request Body:', req.body);
  console.log('Request File:', req.file);
  console.log('Request Headers:', req.headers);

  try {
    // Parse stringified fields if needed
    const parsedBody = { ...req.body };
    const fieldsToParseAsJSON = ['assigns', 'project', 'priority', 'status', 'type'];

    fieldsToParseAsJSON.forEach(field => {
      if (typeof parsedBody[field] === 'string') {
        try {
          parsedBody[field] = JSON.parse(parsedBody[field]);
        } catch (parseError) {
          console.warn(`Could not parse ${field}:`, parseError);
        }
      }
    });

    // Transform body to match model expectations
    const transformedBody = {
      project: parsedBody.project?.value || parsedBody.project,
      assigns: Array.isArray(parsedBody.assigns) 
        ? parsedBody.assigns.map(a => a.value || a)
        : parsedBody.assigns,
      title: parsedBody.title,
      description: parsedBody.description,
      start_date: parsedBody.start_date,
      end_date: parsedBody.end_date,
      priority: parsedBody.priority?.value || parsedBody.priority,
      status: parsedBody.status?.value || parsedBody.status,
      type: parsedBody.type?.value || parsedBody.type
    };

    // Add file attachment if exists
    if (req.file) {
      transformedBody.attachment = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    console.log('Transformed Body:', transformedBody);

    // Validate transformed body
    const { errors, isValid } = tasksValidation(transformedBody);
    
    if (!isValid) {
      console.error('Validation Errors:', errors);
      
      // Delete uploaded file if validation fails
      if (req.file) {
        await deleteFile(req.file.path);
      }
      
      return res.status(400).json(errors);
    }

    // Create task
    const data = await tasksModel.create(transformedBody);

    // Notification logic for assigned users
    if (transformedBody.assigns && transformedBody.assigns.length) {
      const sockets_of_these_people = transformedBody.assigns.reduce(
        (t, n) => [...t, ...socket.methods.getUserSockets(n)],
        []
      );

      // Create notifications for each assigned user
      const notifications = await Promise.all(
        transformedBody.assigns.map(async (assigned) => 
          await addNotification({
            receiver: assigned,
            link: "#",
            text: "You have been assigned a new task"
          })
        )
      );

      // Emit socket notifications
      if (sockets_of_these_people.length > 0) {
        socket.io.to(sockets_of_these_people).emit("notification", notifications);
      }
    }

    res.status(201).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('=================== TASK CREATION ERROR ===================');
    console.error('Full Error:', error);
    
    // Delete uploaded file if error occurs
    if (req.file) {
      await deleteFile(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to create task', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/* Get all tasks */
const GetAll = async (req, res) => {
  try {
    const tasks = await tasksModel.find({})
      .populate('assigns', 'fullName email')
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve tasks', 
      details: error.message 
    });
  }
};

/* Get single task */
const GetOne = async (req, res) => {
  try {
    const task = await tasksModel.findById(req.params.id)
      .populate('assigns', 'fullName email')
      .populate('comments.by', 'fullName email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get Single Task Error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    res.status(500).json({ 
      error: 'Failed to retrieve task', 
      details: error.message 
    });
  }
};

/* UpdateOne tasks with file upload */
const UpdateOne = async (req, res) => {
  try {
    // Parse stringified fields if needed
    const parsedBody = { ...req.body };
    const fieldsToParseAsJSON = ['assigns', 'project', 'priority', 'status', 'type'];

    fieldsToParseAsJSON.forEach(field => {
      if (typeof parsedBody[field] === 'string') {
        try {
          parsedBody[field] = JSON.parse(parsedBody[field]);
        } catch (parseError) {
          console.warn(`Could not parse ${field}:`, parseError);
        }
      }
    });

    // Transform body to match model expectations
    const transformedBody = {
      project: parsedBody.project?.value || parsedBody.project,
      assigns: Array.isArray(parsedBody.assigns) 
        ? parsedBody.assigns.map(a => a.value || a)
        : parsedBody.assigns,
      title: parsedBody.title,
      description: parsedBody.description,
      start_date: parsedBody.start_date,
      end_date: parsedBody.end_date,
      priority: parsedBody.priority?.value || parsedBody.priority,
      status: parsedBody.status?.value || parsedBody.status,
      type: parsedBody.type?.value || parsedBody.type
    };

    // Validate transformed body
    const { errors, isValid } = tasksValidation(transformedBody);
    
    if (!isValid) {
      console.error('Validation Errors:', errors);
      
      // Delete uploaded file if validation fails
      if (req.file) {
        await deleteFile(req.file.path);
      }
      
      return res.status(400).json(errors);
    }

    // Find existing task
    const existingTask = await tasksModel.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Handle file upload
    if (req.file) {
      // Delete existing file if present
      if (existingTask.attachment && existingTask.attachment.path) {
        await deleteFile(existingTask.attachment.path);
      }
      
      // Add new file information
      transformedBody.attachment = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }
    
    // Update task
    const data = await tasksModel.findOneAndUpdate(
      { _id: req.params.id },
      transformedBody,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('assigns', 'fullName email');

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Task Update Error:', error);
    
    // Delete uploaded file if exists
    if (req.file) {
      await deleteFile(req.file.path);
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    res.status(500).json({ 
      error: 'Failed to update task', 
      details: error.message 
    });
  }
};

/* Delete task */
const DeleteOne = async (req, res) => {
  try {
    const task = await tasksModel.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete attachment file if exists
    if (task.attachment && task.attachment.path) {
      await deleteFile(task.attachment.path);
    }
    
    // Delete task
    await tasksModel.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Task Delete Error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete task', 
      details: error.message 
    });
  }
};
// Download attachment
const DownloadAttachment = async (req, res) => {
  try {
    const task = await tasksModel.findById(req.params.id);
    if (!task || !task.attachment || !task.attachment.path) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    
    res.download(task.attachment.path, task.attachment.originalname);
  } catch (error) {
    console.error('Download Attachment Error:', error);
    res.status(500).json({ 
      error: 'Failed to download attachment', 
      details: error.message 
    });
  }
};

// Delete attachment
const DeleteAttachment = async (req, res) => {
  try {
    const task = await tasksModel.findById(req.params.id);
    if (!task || !task.attachment || !task.attachment.path) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    
    // Delete file from disk
    await deleteFile(task.attachment.path);
    
    // Update task to remove attachment reference
    const updatedTask = await tasksModel.findOneAndUpdate(
      { _id: req.params.id },
      { $unset: { attachment: "" } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Delete Attachment Error:', error);
    res.status(500).json({ 
      error: 'Failed to delete attachment', 
      details: error.message 
    });
  }
};

// Add this method to your existing tasks.js controller
const AddFromSuggestion = async (req, res) => {
  try {
    // Parse stringified fields if needed
    const parsedBody = { ...req.body };
    const fieldsToParseAsJSON = ['assigns', 'project', 'priority', 'status', 'type'];

    fieldsToParseAsJSON.forEach(field => {
      if (typeof parsedBody[field] === 'string') {
        try {
          parsedBody[field] = JSON.parse(parsedBody[field]);
        } catch (parseError) {
          console.warn(`Could not parse ${field}:`, parseError);
        }
      }
    });

    // Transform body to match model expectations
    const transformedBody = {
      project: parsedBody.project?.value || parsedBody.project,
      assigns: Array.isArray(parsedBody.assigns) 
        ? parsedBody.assigns.map(a => a.value || a)
        : parsedBody.assigns,
      title: parsedBody.title,
      description: parsedBody.description,
      start_date: parsedBody.start_date,
      end_date: parsedBody.end_date,
      priority: parsedBody.priority?.value || parsedBody.priority,
      status: parsedBody.status?.value || parsedBody.status,
      type: parsedBody.type?.value || parsedBody.type
    };

    // Validate transformed body
    const { errors, isValid } = tasksValidation(transformedBody);
    
    if (!isValid) {
      console.error('Validation Errors:', errors);
      return res.status(400).json(errors);
    }

    // Create task
    const data = await tasksModel.create(transformedBody);
    
    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Add Task from Suggestion Error:', error);
    res.status(500).json({ 
      error: 'Failed to add task from suggestion', 
      details: error.message 
    });
  }
};

// Update the module exports to include the new method
module.exports = {
  Add,
  GetAll,
  GetOne,
  UpdateOne,
  DeleteOne,
  AddFromSuggestion,
  DownloadAttachment,
  DeleteAttachment
};