const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveType", required: true },
    balance: { type: Number, required: true },
    used: Number, 
    carriedOver: Number,
    lastAccrualDate: Date,
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
