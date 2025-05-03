const express = require('express');
const router = express.Router();
const Users = require('../../models/Employee');
const validateMongodbId = require('../util/validateMongodbId');
const authMiddleware = require('../util/middleware');

router.get('/profile',authMiddleware,async(req,res)=>{
    try{
        validateMongodbId(req?.user.id?.replace(/"/g, ""));
    
        const loggedInUser = req?.user.id?.replace(/"/g, "");
        
        res.json({
            loggedInUser,
          });
    } catch (error) {
        throw new Error(error);
    }
})

module.exports=router