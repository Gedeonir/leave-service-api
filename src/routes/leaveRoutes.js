const express = require('express');
const router = express.Router();
const LeaveType = require('../../models/Leave');
const LeaveRequest = require('../../models/LeaveRequests');
const authMiddleware = require('../util/middleware');
const LeaveBalance = require('../../models/LeaveBalance');
const Employee = require('../../models/Employee');
const validateMongooseId = require('../util/validateMongodbId');
const mongoose = require('mongoose');
const validateMongodbId = require('../util/validateMongodbId');
const sendEmail = require('../util/sendEmail');
const uploadDocument = require('../util/uploadDocument');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 
const mime = require('mime-types');


// Add leave type
router.post('/addLeaveType', async (req, res) => {
  try {
    const { name, maximumDays } = req.body;
    const leave = new LeaveType({ name, maximumDays });
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

// Get all leave types
router.get('/leaveTypes', async (req, res) => {
  try {
    const types = await LeaveType.find().sort({ createdAt: -1 });
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update leave type
router.put('/leaveTypes/:id', async (req, res) => {
  try {
    const { name, maximumDays } = req.body;

    const updated = await LeaveType.findByIdAndUpdate(req.params.id, { name, maximumDays }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete leave type
router.delete('/leaveTypes/:id', async (req, res) => {
  try {
    await LeaveType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Get all leave requests
router.get('/request/all', async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('leaveType', 'name maximumDays');
    res.status(200).json(leaves);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/request/upload', authMiddleware,upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = mime.lookup(req.file.originalname); // e.g., 'application/pdf'
    const base64File = `data:${fileType};base64,${req.file.buffer.toString('base64')}`;
    const result = await uploadDocument(base64File, 'leave/documents', `user_${req?.user.id?.replace(/"/g, "")}`);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Create new leave request
router.post('/request/new', authMiddleware, async (req, res) => {
  validateMongodbId(req?.user.id?.replace(/"/g, ""));

  loggedInUser = req?.user.id?.replace(/"/g, "");
  req.body.employee = loggedInUser;

  const start = new Date(req.body.startDate);
  const end = new Date(req.body.endDate);
  try {
    // Calculate difference in milliseconds
    const diffTime = Math.abs(end - start);

    // Convert to days
    const daysUsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


    const balance = await LeaveBalance.findOne({ employee: loggedInUser, leaveType: req.body.leaveType });

    if (!balance || balance.balance - balance.used < daysUsed) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const leave = new LeaveRequest(req.body);
    const saved = await leave.save();

    balance.used += daysUsed;
    balance.balance -= daysUsed;
    await balance.save();
   

    await sendEmail({
      email: req.user,
      subject: "Request sent successfully",
      message: "Your leave request has been sent successfully and is pending approval",
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approve or reject request
router.put('/:id/status', async (req, res) => {
  const { status, approverId, comments } = req.body;
  try {
    const updated = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, approver: approverId, comments },
      { new: true }
    );
    res.status(200).json('updated');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a leave request
router.delete('/:id', async (req, res) => {
  try {
    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
