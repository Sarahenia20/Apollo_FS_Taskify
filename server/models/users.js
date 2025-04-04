const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema(
   {
     fullName: {
       type: String,
       required: true,
     },
     email: {
       type: String,
       required: true,
       unique: true,
     },
     password: {
       type: String,
       required: true,
     },
     phone: {
       type: String,
     },
     picture: {
       type: String,
     },
     skills: {
       type: [String],
       default: [],
       validate: {
         validator: function(v) {
           return v.length <= 10; // Limit to 10 skills
         },
         message: 'Maximum 10 skills allowed'
       }
     },
     roles: {
       type: [String],
       default: ["ENGINEER"],
     },
     reset_token: {
       type: String,
     },
     // New 2FA field
     twoFactorEnabled: {
       type: Boolean,
       default: false, // Note: I changed default to false, but you can adjust
     },
   },
   {
     timestamps: true // Kept your original timestamps
   }
);

module.exports = mongoose.model("users", usersSchema);