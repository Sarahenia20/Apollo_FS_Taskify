<<<<<<< HEAD
const usersModel = require("../models/users");
const rolesModel = require("../models/roles");

const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.user.id).populate("role");

    if (!user || !user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!user.role.permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: "You do not have permission" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { checkPermission };
=======
const ROLES = {
  ADMIN: "ADMIN",
  PROJECT_MANAGER: "PROJECT MANAGER",
  ENGINEER: "ENGINEER",
};

const inRole =
  (...roles) =>
  (req, res, next) => {
    const role = roles.some((role) => req.user.roles.includes(role));
    if (!role) {
      return res.status(403).json();
    }
    next();
    return {
      inRole,
      ROLES,
    };
  };
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
