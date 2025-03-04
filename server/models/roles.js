const mongoose = require("mongoose");
const Schema = mongoose.Schema;
<<<<<<< HEAD

=======
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
const rolesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
<<<<<<< HEAD
      enum: ['ADMIN', 'PROJECT MANAGER', 'ENGINEER']
    },
    permissions: {
      type: [String], // Example: ["CREATE_USER", "UPDATE_USER"]
      default: [],
    },
  },
  { timestamps: true } // Fix typo: use "timestamps" instead of "timestamp"
);

=======
    },
  },
  { timestamp: true }
);
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
module.exports = mongoose.model("roles", rolesSchema);
