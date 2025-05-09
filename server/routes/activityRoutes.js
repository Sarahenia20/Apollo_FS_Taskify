// routes/activityRoutes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const activityController = require("../controllers/activityController");

// Apply JWT authentication to all routes
router.use(passport.authenticate("jwt", { session: false }));

// SPECIFIC ROUTES FIRST - Note the order is crucial!
// GET /api/activities/persona
router.get("/persona/:userId?", activityController.getUserPersona);

// GET /api/activities/stats
router.get("/stats/:userId?", activityController.getActivityStats);

// GET /api/activities/task-priorities
router.get("/task-priorities/:userId?", activityController.getTaskPriorities);

// GET /api/activities/dashboard
router.get("/dashboard/:userId?", activityController.getDashboardSummary);

// PARAMETERIZED ROUTES LAST
// GET /api/activities/:userId? - This will now only match if none of the above match
router.get("/:userId?", activityController.getUserActivities);

module.exports = router;