const express = require("express");
const router = express.Router();
const { DateTime } = require("luxon");
const LeaveBalance = require("../../models/LeaveBalance");
const LeaveType = require("../../models/Leave");
const Employee = require("../../models/Employee");

async function accrueLeave() {
    try {
      const leaveTypes = await LeaveType.find();
      const employees = await Employee.find();
      const today = DateTime.now().setZone("Africa/Kigali");
  
      for (const employee of employees) {
        for (const type of leaveTypes) {
          const accrual = 1.66;
  
          let balance = await LeaveBalance.findOne({
            employee: employee._id,
            leaveType: type._id,
          });
  
          if (!balance) {
            // Create new balance
            balance = new LeaveBalance({
              employee: employee._id,
              leaveType: type._id,
              total: accrual,
              used: 0,
              lastAccrualDate: today.toJSDate(),
            });
          } else {
            const unused = balance.balance - balance.used;
  
            // Jan 1st: Carry forward max 5 days
            if (today.month === 1 && today.day === 1) {
              balance.total = Math.min(unused, 5);
              balance.used = 0; // Reset used since it's a new year
            }
  
            // Jan 31st: Expire excess carry-forward
            if (today.month === 1 && today.day === 31) {
              const updatedUnused = balance.total - balance.used;
              if (updatedUnused > 5) {
                balance.total = balance.used + 5;
              }
            }
  
            // Always accrue monthly
            balance.total += accrual;
            balance.lastAccrualDate = today.toJSDate();
          }
  
          await balance.save();
        }
      }
  
      return ({ message: "Accrual completed with year-end rules" });
    } catch (err) {
     return({ error: err.message });
    }
}

module.exports = accrueLeave;
