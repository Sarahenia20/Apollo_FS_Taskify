// models/Role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  permissions: {
    createTask: {
      type: Boolean,
      default: false
    },
    viewTasks: {
      type: Boolean,
      default: false
    },
    editTasks: {
      type: Boolean,
      default: false
    },
    deleteTasks: {
      type: Boolean,
      default: false
    },
    manageUsers: {
      type: Boolean,
      default: false
    },
    viewReports: {
      type: Boolean,
      default: false
    },
    manageProjects: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Role', roleSchema);