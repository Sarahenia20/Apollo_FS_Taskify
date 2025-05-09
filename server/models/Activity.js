// models/Activity.js
const mongoose = require("mongoose");

/**
 * Activity Schema - Tracks all user actions within the system
 * This provides the foundation for the AI persona analysis
 */
const activitySchema = new mongoose.Schema({
  // User who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to your existing User model
    required: true,
    index: true // Add index for query performance
  },
  
  // The action performed (e.g., "Created task", "Completed task")
  action: {
    type: String,
    required: true
  },
  
  // Category of action for easier querying and analysis
  actionType: {
    type: String,
    enum: [
      "task_created", 
      "task_updated", 
      "task_completed",
      "task_deleted",
      "comment_added",
      "profile_updated",
      "team_action",
      "login",
      "logout",
      "other"
    ],
    required: true,
    index: true // Add index for performance
  },
  
  // Additional details about the action
  details: String,
  
  // When the action occurred
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Add index for time-based queries
  },
  
  // Reference to the related entity (task, comment, etc.)
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  
  // Type of the related entity (Task, User, Team, etc.)
  relatedEntityType: String,
  
  // Optional metadata for additional context
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // For task activities: store the task category for AI analysis
  taskCategory: String,
  
  // For task activities: store the task priority for AI analysis
  taskPriority: String,
  
  // Device/browser info
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  },
  
  // IP address (optional, useful for security analysis)
  ipAddress: String
});

// Index for efficient querying by user and time period
activitySchema.index({ user: 1, timestamp: -1 });

// Index for task analysis
activitySchema.index({ user: 1, taskCategory: 1 });

// Pre-save middleware to extract key information when related to tasks
activitySchema.pre("save", async function(next) {
  try {
    // If this is a task-related activity and has a relatedEntityId
    if (
      this.relatedEntityType === "Task" && 
      this.relatedEntityId && 
      !this.taskCategory
    ) {
      // Try to get the task from the database to extract category
      const Task = mongoose.model("tasks");
      const task = await Task.findById(this.relatedEntityId);
      
      if (task) {
        // Find task type from your existing MOCK_TYPE
        // This assumes you have access to MOCK_TYPE data
        // You may need to adjust this based on your actual implementation
        const taskType = global.MOCK_TYPE?.find(t => t.value === task.type);
        
        if (taskType && taskType.category) {
          this.taskCategory = taskType.category;
        }
        
        // Store priority for analysis
        this.taskPriority = task.priority;
      }
    }
    next();
  } catch (error) {
    console.error("Error in Activity pre-save middleware:", error);
    next();
  }
});

// Method to find recent activities by type
activitySchema.statics.findRecentByType = function(userId, type, limit = 10) {
  return this.find({
    user: userId,
    actionType: type
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Method to count activities by category
activitySchema.statics.countByTaskCategory = function(userId, startDate = null) {
  const match = { user: userId, taskCategory: { $exists: true, $ne: null } };
  
  if (startDate) {
    match.timestamp = { $gte: startDate };
  }
  
  return this.aggregate([
    { $match: match },
    { $group: { _id: "$taskCategory", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;