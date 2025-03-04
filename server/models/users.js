const mongoose = require("mongoose");
const Schema = mongoose.Schema;
<<<<<<< HEAD

const usersSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles", // Link to the roles model
    },
    reset_token: { type: String },
  },
  { timestamps: true }
);

=======
const usersSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    picture: {
      type: String,
    },
    roles: {
      type: [String],
      default: ["ENGINEER"],
    },
    reset_token: {
      type: String,
    },
  },
  { timestamp: true }
);
>>>>>>> de61867d662b9dd3f78bf7b0f5aa57b92ee376a6
module.exports = mongoose.model("users", usersSchema);
