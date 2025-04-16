require('dotenv').config();
const tasksModel = require("../models/tasks");
const usersModel = require("../models/users");
const socket = require("../socket");
const tasksValidation = require("../validation/tasksValidation");
const { addNotification } = require("./notifications");
const { nodeMailer } = require("../config/nodeMailer");
const twilioClient = require("../config/twilioClient");  // Twilio Client
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
  const { errors, isValid } = tasksValidation(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    // Formatage des données
    req.body.project = req.body.project.value.toString();
    req.body.assigns = req.body.assigns.map((a) => a.value);
    req.body.priority = req.body.priority.value.toString();
    req.body.status = req.body.status.value.toString();
    req.body.type = req.body.type.value.toString();

    const data = await tasksModel.create(req.body);

    // Récupérer les sockets et les utilisateurs assignés
    const sockets_of_these_people = req.body.assigns.reduce(
      (acc, userId) => [...acc, ...socket.methods.getUserSockets(userId)],
      []
    );

    const assignedUsers = await usersModel.find(
      { _id: { $in: req.body.assigns } },
      "email phoneNumber"
    );


    console.log("📋 Utilisateurs assignés (infos complètes):", assignedUsers);

    const dueDate = new Date(req.body.dueDate).toLocaleDateString();

    // Notifications
    let notification;
    for (const assigned of req.body.assigns) {
      notification = await addNotification({
        receiver: assigned,
        link: "#",
        text: "You have been assigned a new task",
      });
    }

    if (sockets_of_these_people.length > 0) {
      socket.io.to(sockets_of_these_people).emit("notification", notification);
    }

    // Envoi des e-mails + SMS
    for (const user of assignedUsers) {
      const subject = `Nouvelle tâche: ${req.body.title}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Nouvelle tâche assignée</h2>
          <p>Une nouvelle tâche vous a été assignée :</p>
          <ul>
            <li><strong>Titre:</strong> ${req.body.title}</li>
            <li><strong>Description:</strong> ${req.body.description || "Aucune description"}</li>
            <li><strong>Date limite:</strong> ${req.body.end_date}</li>
            <li><strong>Priorité:</strong> ${req.body.priority}</li>
          </ul>
          <p style="color: #d9534f; font-weight: bold;">Merci de respecter la date limite !</p>
        </div>
      `;

      // Envoi de l'e-mail
      try {
        await nodeMailer(user.email, subject, html);
      } catch (error) {
        console.error(`❌ Erreur email à ${user.email}:`, error);
      }

      // Envoi du SMS
      if (user.phoneNumber && user.phoneNumber.startsWith("+")) {
        try {
          await twilioClient.messages.create({
            body: `Test SMS`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: "+21699385385", // à la place de user.phoneNumber temporairement
          });
          

          console.log(`✅ SMS envoyé à ${user.phoneNumber}`);
        } catch (error) {
          console.error(`❌ Erreur SMS à ${user.phoneNumber}:`, error);
        }
      } else {
        console.warn(`⚠️ Aucun numéro Twilio valide pour ${user.email} (${user.phoneNumber})`);
      }
    }

    res.status(201).json({
      success: true,
      data: data,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
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

/* Get single task with improved error handling */
const GetOne = async (req, res) => {
  console.log('GetOne Task Request:', { 
    taskId: req.params.id,
    userID: req.user?.id
  });
  
  try {
    // Validate task ID
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid task ID provided"
      });
    }
    
    // Find the task by ID with comprehensive population - Add detailed try/catch for debugging
    let task;
    try {
      task = await tasksModel.findById(req.params.id);
      console.log('Raw task found:', task ? task._id : 'Not found');
    } catch (findError) {
      console.error('Error finding task by ID:', findError);
      return res.status(500).json({
        success: false,
        message: "Database error when finding task",
        error: findError.message
      });
    }

    // Check if task exists before trying to populate
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Populate assigns separately with error handling
    try {
      await task.populate({
        path: 'assigns',
        select: 'fullName email picture',
      });
      console.log('Assigns populated successfully');
    } catch (assignsError) {
      console.error('Error populating assigns:', assignsError);
      // Continue instead of failing - partial data is better than none
    }

    // Populate comments.by separately with error handling
    try {
      await task.populate({
        path: 'comments.by',
        select: 'fullName email picture',
      });
      console.log('Comments populated successfully:', task.comments?.length || 0);
    } catch (commentsError) {
      console.error('Error populating comments:', commentsError);
      // Continue instead of failing - partial data is better than none
    }

    // Log successful retrieval
    console.log('Task data prepared for response:', {
      id: task._id,
      title: task.title,
      commentCount: task.comments?.length || 0
    });

    // Return the task data
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('GetOne Task Error:', error);
    
    // Return detailed error information
    return res.status(500).json({ 
      success: false,
      message: "Server error when retrieving task",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
// Add this to your controllers/tasks.js file

/* Reschedule Task (Update date/time via drag and drop) */
const RescheduleTask = async (req, res) => {
  console.log("RescheduleTask controller called with data:", req.body);
  
  try {
    // Extract the task ID from URL parameters
    const { id } = req.params;
    
    // Extract new dates from request body
    const { start_date, end_date, is_all_day } = req.body;

    // Validate input
    if (!start_date || !end_date) {
      console.log("Missing required fields:", { start_date, end_date });
      return res.status(400).json({ 
        success: false,
        error: 'Start date and end date are required',
      });
    }

    // Find the task
    const task = await tasksModel.findById(id);
    if (!task) {
      console.log("Task not found:", id);
      return res.status(404).json({ 
        success: false,
        error: 'Task not found' 
      });
    }

    // Convert string dates to Date objects
    let newStartDate, newEndDate;
    
    try {
      newStartDate = new Date(start_date);
      newEndDate = new Date(end_date);
      
      // Validate date objects
      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        throw new Error("Invalid date format");
      }
      
      console.log("Parsed dates:", {
        newStartDate: newStartDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
      });
    } catch (dateError) {
      console.error("Date parsing error:", dateError);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid date format',
        details: dateError.message
      });
    }
    
    // Validate dates
    if (newEndDate < newStartDate) {
      console.log("End date before start date:", { start: newStartDate, end: newEndDate });
      return res.status(400).json({ 
        success: false,
        error: 'End date cannot be before start date',
      });
    }

    // Update task dates
    task.start_date = newStartDate;
    task.end_date = newEndDate;
    
    // Update all-day status if provided
    if (typeof is_all_day !== 'undefined') {
      task.is_all_day = is_all_day;
    }

    // Save the task
    const updatedTask = await task.save();
    console.log("Task updated successfully:", updatedTask._id);

    // Return the updated task
    res.status(200).json({
      success: true,
      message: 'Task rescheduled successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Task Reschedule Error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid task ID' 
      });
    }
    
    // General error handling
    res.status(500).json({ 
      success: false,
      error: 'Failed to reschedule task', 
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
  RescheduleTask,
  DeleteAttachment
};