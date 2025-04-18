const express = require("express");
const Router = express.Router();
const passport = require("passport");
const ProjectModel = require("../models/projet");
const TaskModel = require("../models/tasks");

// In-memory context store (for demo; use Redis or DB for production)
const userContexts = {};

Router.post("/chatbot/message", passport.authenticate("jwt", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!userContexts[userId]) userContexts[userId] = {};

    const messageIncludes = (msg, keywords) => {
      msg = msg.toLowerCase();
      return keywords.some(keyword => msg.includes(keyword));
    };

    let response = "I'm sorry, I can only answer basic questions right now.";
    let suggestions = [];

    // Greetings
    if (messageIncludes(message, ['hello', 'hi', 'hey', 'hii', 'helo'])) {
      userContexts[userId].lastQuery = null;
      const messages = [
        `👋 Hello ${req.user.fullName}! I'm your Taskify Assistant. How can I help you today?`,
        "I can help you with:",
        "📊 Project Management\n- View project status\n- Check project details\n- Get project summaries",
        "📋 Task Management\n- View your tasks\n- Check task status\n- Get task deadlines",
        "Just ask me anything about your projects or tasks!"
      ];
      suggestions = ["How many projects do I have?", "How many tasks do I have?"];
      return res.json({ messages, suggestions });
    }

    // Appreciation / Acknowledgment
    if (messageIncludes(message, ['thanks', 'thank you', 'good', 'nice', 'cool', 'great', 'appreciate'])) {
      response = "😊 You're very welcome! I'm always here to help.";
      suggestions = ["Show my tasks", "Create new project"];
      return res.json({ response, suggestions });
    }

    // Help
    if (messageIncludes(message, ['help', 'what can you do', 'commands', 'guide'])) {
      userContexts[userId].lastQuery = null;
      const messages = [
        "🤖 I'm here to assist you with project and task management. Here's what I can do:",
        "📊 Projects:\n- Show all projects\n- Project status updates\n- Project details and progress",
        "📋 Tasks:\n- View task lists\n- Task status and priorities\n- Upcoming deadlines",
        "💡 Try asking:\n- 'Show my projects'\n- 'What tasks do I have?'\n- 'Project status update'"
      ];
      suggestions = ["Show my projects", "Show my tasks"];
      return res.json({ messages, suggestions });
    }

    // Project count
    if (messageIncludes(message, ['how many project', 'number of project', 'total project', 'my projects'])) {
      const projects = await ProjectModel.find({});
      const projectCount = projects.length;
      userContexts[userId].lastQuery = 'projects';
      if (projectCount > 0) {
        response = `📊 You have ${projectCount} project${projectCount !== 1 ? 's' : ''} in total. Would you like to see the details?`;
        suggestions = ["Yes", "No", "Create new project"];
      } else {
        response = "📂 There are no projects in the system yet. Would you like to create one?";
        suggestions = ["Create new project"];
      }
      return res.json({ response, suggestions });
    }

    // Task count
    if (messageIncludes(message, ['how many task', 'number of task', 'total task', 'my tasks'])) {
      const tasks = await TaskModel.find({})
        .populate('assigns', 'fullName')
        .populate('project', 'project_name');
      userContexts[userId].lastQuery = 'tasks';
      if (tasks.length > 0) {
        response = `📋 You have ${tasks.length} task${tasks.length !== 1 ? 's' : ''} in total. Would you like to see the details?`;
        suggestions = ["Yes", "No", "Create new task"];
      } else {
        response = "📋 You don't have any tasks yet. Would you like to create one?";
        suggestions = ["Create new task"];
      }
      return res.json({ response, suggestions });
    }

    // Details for last query
    if (messageIncludes(message, ['yes', 'ok', 'show', 'details', 'sure', 'tell me'])) {
      if (userContexts[userId].lastQuery === 'projects') {
        const projects = await ProjectModel.find({});
        if (projects.length > 0) {
          const messages = [];
          const projectsByStatus = {
            'in progress': projects.filter(p => p.status === 'in progress'),
            'completed': projects.filter(p => p.status === 'completed'),
            'on hold': projects.filter(p => p.status === 'on hold')
          };
          for (const [status, statusProjects] of Object.entries(projectsByStatus)) {
            if (statusProjects.length > 0) {
              messages.push(`\n${status.toUpperCase()} (${statusProjects.length}):`);
              statusProjects.forEach((p, index) => {
                messages.push(`Project ${index + 1}: ${p.project_name}\nManager: ${p.project_manager}\nPriority: ${p.priority}`);
              });
            }
          }
          suggestions = ["Create new project"];
          return res.json({ messages, suggestions });
        }
      } else if (userContexts[userId].lastQuery === 'tasks') {
        const tasks = await TaskModel.find({})
          .populate('assigns', 'fullName')
          .populate('project', 'project_name');
        if (tasks.length > 0) {
          const messages = [];
          const tasksByStatus = {
            '1': tasks.filter(t => t.status === '1'),
            '2': tasks.filter(t => t.status === '2'),
            '3': tasks.filter(t => t.status === '3'),
            '4': tasks.filter(t => t.status === '4')
          };
          const statusNames = {
            '1': '📝 To Do',
            '2': '🔄 In Progress',
            '3': '👀 In Review',
            '4': '✅ Completed'
          };
          for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
            if (statusTasks.length > 0) {
              messages.push(`${statusNames[status]} (${statusTasks.length}):`);
              statusTasks.forEach((task, index) => {
                messages.push(`Task ${index + 1}: ${task.title}\nProject: ${task.project?.project_name || 'No Project'}\nPriority: ${task.priority}\nDue: ${new Date(task.end_date).toLocaleDateString()}`);
              });
            }
          }
          suggestions = ["Create new task"];
          return res.json({ messages, suggestions });
        }
      }
    }

    // Handle "No" or negative responses
    if (messageIncludes(message, ['no', 'not now', 'maybe later', 'cancel'])) {
      userContexts[userId].lastQuery = null;
      response = "No problem! If you need anything else, just ask. 😊";
      suggestions = [
        "Show my projects",
        "Show my tasks",
        "Create new project",
        "Create new task"
      ];
      return res.json({ response, suggestions });
    }

    // If nothing matched
    res.json({ response, suggestions });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = Router;
