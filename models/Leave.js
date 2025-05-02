const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    maximumDays: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
