const express = require("express");
const Router = express.Router();
const passport = require("passport");
const axios = require('axios');
const ProjectModel = require("../models/projet");
const TaskModel = require("../models/tasks");

// In-memory context store
const userContexts = {};

Router.post("/chatbot/message", passport.authenticate("jwt", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Initialize context if not present
    if (!userContexts[userId]) userContexts[userId] = {};

    // Log every incoming message for debugging
    console.log(`[CHATBOT] Received message: "${message}"`);

    // STEP 1: Handle greetings - these show the menu
    const greetings = ['hello', 'hi', 'hey', 'hii', 'helo', 'start', 'help'];
    if (greetings.includes(message.toLowerCase().trim())) {
      console.log("[CHATBOT] Detected greeting, showing menu");
      userContexts[userId].lastQuery = null;
      
      const messages = [
        `👋 Hello ${req.user.fullName}! I'm your Taskify Assistant.`,
        "I can help you with project management or answer any questions!",
        "Use the buttons below for quick actions:"
      ];
      
      const suggestions = [
        "Show my projects",
        "Show my tasks",
        "Create new project",
        "Create new task"
      ];
      
      return res.json({ messages, suggestions });
    }

    // STEP 2: Handle EXACT button text only
    const buttonHandlers = {
      "Show my projects": async () => {
        console.log("[CHATBOT] Handling 'Show my projects'");
        const projects = await ProjectModel.find({});
        userContexts[userId].lastQuery = 'projects';
        
        return {
          response: projects.length > 0 
            ? `📊 You have ${projects.length} project${projects.length !== 1 ? 's' : ''}. Would you like to see details?`
            : "📂 No projects yet. Would you like to create one?",
          suggestions: projects.length > 0 
            ? ["Yes", "No", "Create new project"]
            : ["Create new project", "Help"]
        };
      },
      
      "Show my tasks": async () => {
        console.log("[CHATBOT] Handling 'Show my tasks'");
        const tasks = await TaskModel.find({});
        userContexts[userId].lastQuery = 'tasks';
        
        return {
          response: tasks.length > 0
            ? `📋 You have ${tasks.length} task${tasks.length !== 1 ? 's' : ''}. Would you like to see details?`
            : "📋 No tasks yet. Would you like to create one?",
          suggestions: tasks.length > 0
            ? ["Yes", "No", "Create new task"]
            : ["Create new task", "Help"]
        };
      },
      
      "Yes": async () => {
        if (!userContexts[userId].lastQuery) {
          return {
            response: "Yes to what? Try asking me a specific question!",
            suggestions: ["Show my projects", "Show my tasks", "Help"]
          };
        }
        
        // Handle showing details based on last query
        if (userContexts[userId].lastQuery === 'projects') {
          const projects = await ProjectModel.find({});
          const messages = ["Here are your projects:"];
          
          projects.forEach((project, index) => {
            messages.push(`${index + 1}. ${project.project_name} - ${project.status}`);
          });
          
          return { messages, suggestions: ["Show my tasks", "Help"] };
        }
        
        if (userContexts[userId].lastQuery === 'tasks') {
          const tasks = await TaskModel.find({});
          const messages = ["Here are your tasks:"];
          
          tasks.forEach((task, index) => {
            messages.push(`${index + 1}. ${task.title} - ${task.status}`);
          });
          
          return { messages, suggestions: ["Show my projects", "Help"] };
        }
      },
      
      "No": async () => {
        userContexts[userId].lastQuery = null;
        return {
          response: "No problem! What else can I help you with?",
          suggestions: ["Show my projects", "Show my tasks", "Help"]
        };
      }
    };

    // Check if message matches any button exactly
    if (buttonHandlers[message]) {
      console.log(`[CHATBOT] Found exact button match for: "${message}"`);
      const result = await buttonHandlers[message]();
      return res.json(result);
    }

    // STEP 3: Everything else goes to Gemini
    console.log(`[CHATBOT] No button match, sending to Gemini: "${message}"`);
    
    try {
      const GEMINI_API_KEY = process.env.TASKIFY_GEMINI_API_KEY;
      
      // Debug: Check if API key exists
      console.log("[GEMINI] API Key exists:", !!GEMINI_API_KEY);
      
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not found in environment variables');
      }

      console.log("[GEMINI] Making API request...");
      
      const geminiResponse = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        method: "post",
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          contents: [{ 
            parts: [{ 
              text: message
            }] 
          }],
        },
        timeout: 10000 // 10 second timeout
      });

      console.log("[GEMINI] Response received successfully");
      
      const aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
      
      return res.json({ 
        response: aiResponse,
        suggestions: ["Help"] // Simple suggestion to get back to menu
      });
      
    } catch (geminiError) {
      console.error("[GEMINI] Error occurred:", geminiError.message);
      console.error("[GEMINI] Full error:", JSON.stringify(geminiError.response?.data || {}, null, 2));
      
      // Return a user-friendly error message
      return res.json({ 
        response: "I'm having trouble with my AI brain right now. Try using the buttons below!",
        suggestions: ["Show my projects", "Show my tasks", "Help"],
        debug: process.env.NODE_ENV === 'development' ? geminiError.message : undefined
      });
    }
    
  } catch (error) {
    console.error("[CHATBOT] General error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = Router;