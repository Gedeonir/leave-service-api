const { default: mongoose } = require("mongoose");

const dbConnect = async() => {
  try {
  
    await mongoose.connect(`${process.env.MONGODB_URL}`);
  } catch (error) {
    console.log("Database connection error",error);
    process.exit(1)
  }
};
module.exports = dbConnect;