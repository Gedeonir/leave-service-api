const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Employee = require("../../models/Employee");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1].replace(/"/g, '');
  
      try {
        if (token) {
          const decoded = jwt.verify(token, process.env.jwtsecret);
  
const user = await Employee.findOne({ email: decoded.sub.toLowerCase() });
console.log("User found:", user);
          req.user = user;
          next();
        }
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized or token expired, please login again");
      }
    } else {
      res.status(401);
      throw new Error("No token attached to the header");
    }
  });
  

module.exports = authMiddleware;