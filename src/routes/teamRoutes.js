const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const Leave = require('../../models/Leave');  


router.get('/on-leave', async (req, res) => {
  const today = new Date();

  try {
    const leaves = await Leave.find({
      startDate: { $lte: today },  
      endDate: { $gte: today },   
      status: 'APPROVED'          
    })
    .populate('user', 'name image'); 

    
    const formatted = leaves.map(l => ({
      name: l.user.name,
      profileImage: l.user.image || null, 
      until: l.endDate,
      type: l.type
    }));

    res.json(formatted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
