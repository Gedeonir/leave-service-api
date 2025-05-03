const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Employee = require("../../models/Employee");
const mongoose = require("mongoose");

const authMiddleware = async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1].replace(/"/g, '');
  
      try {
        if (token) {
          const fetchEmployees = async () => {
            const res = await fetch(`${process.env.Auth_URL}/employees`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await res.json();
            return data;
          };

          const employees = await fetchEmployees();

          const decoded = jwt.verify(token, process.env.jwtsecret);

  
          const user = await employees.find(
            (user) => user.email === decoded.sub
          );
  
          if (!user) {
            throw new Error("User not found");
          }
          req.user = user;
          next();
        }
      } catch (error) {
        console.log(error);
        throw new Error("Not authorized or token expired, please login again");
      }
    } else {
      res.status(401);
      throw new Error("No token attached to the header");
    }
  };
  

module.exports = authMiddleware;