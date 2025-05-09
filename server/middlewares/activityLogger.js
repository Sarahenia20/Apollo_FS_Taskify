// middleware/activityLogger.js
const Activity = require("../models/Activity");

/**
 * Activity Logger Middleware
 * 
 * This middleware adds a logActivity function to the request object,
 * allowing any controller to easily log user activities.
 * 
 * The logged activities become the foundation for AI analysis.
 */
const activityLogger = (req, res, next) => {
  /**
   * Add a logActivity method to the request object
   * Controllers can call this method to log activities
   * 
   * @param {string} action - The action description (e.g., "Created task")
   * @param {string} details - Additional details about the action
   * @param {string} actionType - Category of action (task_created, login, etc.)
   * @param {ObjectId} relatedEntityId - ID of related entity (task, comment)
   * @param {string} relatedEntityType - Type of related entity (Task, User)
   * @param {Object} metadata - Optional additional data to store
   * @returns {Promise<Activity>} - The saved activity document
   */
  req.logActivity = async (
    action,
    details,
    actionType,
    relatedEntityId = null,
    relatedEntityType = null,
    metadata = {}
  ) => {
    try {
      // Only log if we have a user
      if (!req.user || !req.user._id) return null;
      
      // Extract device info from user agent
      const userAgent = req.headers["user-agent"];
      const deviceInfo = parseUserAgent(userAgent);
      
      // Create new activity document
      const activity = new Activity({
        user: req.user._id,
        action,
        details,
        actionType,
        relatedEntityId,
        relatedEntityType,
        metadata,
        deviceInfo,
        ipAddress: req.ip
      });
      
      // Save asynchronously - don't await to avoid slowing down response
      // This is a "fire and forget" approach for logging
      activity.save().catch(err => {
        console.error("Error saving activity log:", err);
      });
      
      return activity;
    } catch (error) {
      console.error("Error in logActivity:", error);
      return null;
    }
  };
  
  // Continue to the next middleware or route handler
  next();
};

/**
 * Parse User Agent string to extract device information
 * This helps provide context for activity analysis
 * 
 * @param {string} userAgent - Browser/device user agent string
 * @returns {Object} - Parsed device information
 */
function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  
  const deviceInfo = {
    browser: "Unknown",
    os: "Unknown",
    device: "Unknown"
  };
  
  // Basic OS detection
  if (userAgent.includes("Windows")) deviceInfo.os = "Windows";
  else if (userAgent.includes("Mac")) deviceInfo.os = "Mac";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) deviceInfo.os = "iOS";
  else if (userAgent.includes("Android")) deviceInfo.os = "Android";
  else if (userAgent.includes("Linux")) deviceInfo.os = "Linux";
  
  // Basic browser detection
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) deviceInfo.browser = "Chrome";
  else if (userAgent.includes("Firefox")) deviceInfo.browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) deviceInfo.browser = "Safari";
  else if (userAgent.includes("Edg")) deviceInfo.browser = "Edge";
  
  // Basic device type
  if (userAgent.includes("Mobile")) deviceInfo.device = "Mobile";
  else if (userAgent.includes("Tablet")) deviceInfo.device = "Tablet";
  else deviceInfo.device = "Desktop";
  
  return deviceInfo;
}

module.exports = activityLogger;