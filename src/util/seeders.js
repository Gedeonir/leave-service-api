const Users =require("../../models/Employee");
const dbConnect = require("../../config/database");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");


const seedUser=async()=>{
    const salt = await bcrypt.genSaltSync(10);

    try {
        const email=process.env.USER_EMAIL
        
        await Users.deleteOne({email});

        const adminUser=[{
            "name": "John Doe",
            "profileImage": "https://example.com/images/john.jpg",
            "email": "eonged827@gmail.com",
            "password": "eonged827@gmail.com",
            "role": "ADMIN"


          }]
        await Users.insertMany(adminUser);
        console.log("success")
    } catch (error) {

        console.log("seeds failed\n",error);
        
    }

}

dbConnect().then(() => {
    console.log("Database connected!");
    seedUser().then(()=>{
        mongoose.connection.close();
    });
})