const express = require("express");
const Router = express();
const Controllers = require("../controllers/roles");

Router.post("/roles", Controllers.Add);
Router.get("/roles", Controllers.GetAll);
Router.get("/roles/:id", Controllers.GetOne);
Router.put("/roles/:id", Controllers.UpdateOne);
Router.delete("/roles/:id", Controllers.DeleteOne);

module.exports = Router;
// routes/roles.router.js
/*const express = require("express");
const router = express.Router();
const Controllers = require("../controllers/roles");
// Remove auth middleware dependency for now
// const { verifyToken } = require("../middleware/auth");
// const { inRole, ROLES } = require("../middleware/roles");

// All routes without auth - for development
router.post("/roles", Controllers.Add);
router.get("/roles", Controllers.GetAll);
router.get("/roles/:id", Controllers.GetOne);
router.put("/roles/:id", Controllers.UpdateOne);
router.delete("/roles/:id", Controllers.DeleteOne);

// Add description generation endpoint
router.post("/roles/generate-description", async (req, res) => {
  try {
    const { roleName } = req.body;
    
    if (!roleName) {
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
});

module.exports = router;*/
