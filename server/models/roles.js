const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const rolesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamp: true }
);
module.exports = mongoose.model("roles", rolesSchema);
// models/roles.js
/*const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RolesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    permissions: {
      type: [String],
      default: []
    },
    avatar: {
      type: String,
      default: function() {
        // Generate avatar from first letter of title
        return this.title.substring(0, 1).toUpperCase();
      }
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("roles", RolesSchema);*/
