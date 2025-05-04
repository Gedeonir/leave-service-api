const express = require("express");
const router = express.Router();
const LeaveBalance = require("../../models/LeaveBalance");
const LeaveType = require("../../models/Leave");
const Employee = require("../../models/Employee");

// GET /balance/:employeeId — Get all balances for an employee
router.get("/:employeeId", async (req, res) => {

  try {
    const balances = await LeaveBalance.find({ employee: req.params.employeeId })
      .populate("leaveType", "name maximumDays");
      

    res.status(200).json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/balances/all", async (req, res) => {
  try {
    const balances = await LeaveBalance.find({ employee: req.params.employeeId })
      .populate("leaveType", "name maximumDays");

    res.status(200).json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /balance/adjust — Admin manually adjusts a balance
router.post("/adjust", async (req, res) => {
  const { employeeId, leaveTypeId, amount } = req.body;


  try {
    let balance = await LeaveBalance.findOne({ employee: employeeId, leaveType: leaveTypeId });

    if (!balance) {
      // Create if not found
      balance = new LeaveBalance({
        employee: employeeId,
        leaveType: leaveTypeId,
        balance: amount,
        used: 0,
      });
    } else {
      balance.balance += amount;
    }

    await balance.save();
    res.status(200).json(balance);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /balance/accrue — Monthly accrual for all employees
router.post("/accrue", async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find(); // For each type's default
    const employees = await Employee.find();

    for (const employee of employees) {
      for (const type of leaveTypes) {
        const accrual = 1.66; // can be dynamic per type if needed

        let balance = await LeaveBalance.findOne({
          employee: employee._id,
          leaveType: type._id,
        });

        if (!balance) {
          balance = new LeaveBalance({
            employee: employee._id,
            leaveType: type._id,
            balance: accrual,
            used: 0,
            lastAccrualDate: new Date(),
          });
        } else {
          balance.total += accrual;
          balance.lastAccrualDate = new Date();
        }

        await balance.save();
      }
    }

    res.status(200).json({ message: "Accrual completed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /balance/use — Deduct balance when leave is used
router.put("/use", async (req, res) => {
  const { employeeId, leaveTypeId, daysUsed } = req.body;

  try {
    const balance = await LeaveBalance.findOne({ employee: employeeId, leaveType: leaveTypeId });

    if (!balance || balance.balance - balance.used < daysUsed) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    balance.used += daysUsed;
    await balance.save();

    res.status(200).json({ message: "Leave deducted", balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
