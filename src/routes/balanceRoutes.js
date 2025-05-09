const express = require("express");
const router = express.Router();
const LeaveBalance = require("../../models/LeaveBalance");
const LeaveType = require("../../models/Leave");
const Employee = require("../../models/Employee");
const { DateTime } = require("luxon");
const authMiddleware = require("../util/middleware");

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

router.post("/accrue", authMiddleware, async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find();
    const today = DateTime.now().setZone("Africa/Kigali");


    for (const employee of req.employees) {
      for (const type of leaveTypes) {
        const accrual = 1.66;

        let balance = await LeaveBalance.findOne({
          employee: employee.id,
          leaveType: type._id,
        });

        if (!balance) {
          // Create new balance
          balance = new LeaveBalance({
            employee: employee.id,
            leaveType: type._id,
            balance: accrual,
            used: 0,
            lastAccrualDate: today.toJSDate(),
          });
        } else {
          const unused = balance.balance - balance.used;

          // Jan 1st: Carry forward max 5 days
          if (today.month === 1 && today.day === 1) {
            balance.balance = Math.min(unused, 5);
            balance.used = 0; // Reset used since it's a new year
          }

          // Jan 31st: Expire excess carry-forward
          if (today.month === 1 && today.day === 31) {
            const updatedUnused = balance.balance - balance.used;
            if (updatedUnused > 5) {
              balance.total = balance.used + 5;
            }
          }

          // Always accrue monthly
          balance.balance += accrual;
          balance.lastAccrualDate = today.toJSDate();
        }

        await balance.save();
      }
    }

    res.status(200).json({ message: "Accrual completed with year-end rules" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
