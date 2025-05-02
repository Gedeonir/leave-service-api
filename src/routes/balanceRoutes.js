const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Assuming you have the Mongoose models defined for LeaveBalance and Employee
const LeaveBalance = require('../../models/LeaveBalance');
const Employee = require('../../models/Employee');

// Get leave balance for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const balance = await LeaveBalance.findOne({ employee: mongoose.Types.ObjectId(userId) }).populate('employee');
    if (!balance) {
      return res.status(404).json({ error: 'Leave balance not found for this user.' });
    }
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the leave balance.' });
  }
});

// Update balance manually (Admin/HR)
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const data = req.body; // e.g., { annual: 5, sick: 2, maternity: 3 }
  
  try {
    const updated = await LeaveBalance.findOneAndUpdate(
      { employee: mongoose.Types.ObjectId(userId) },
      { $set: data },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Leave balance not found for this user.' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the leave balance.' });
  }
});

module.exports = router;
