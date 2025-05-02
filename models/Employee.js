const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    department: { type: String },
    role: {
      type: String,
      enum: ["STAFF", "MANAGER", "ADMIN"],
      default: "STAFF",
    },
    createdAt: { type: Date, default: Date.now },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
