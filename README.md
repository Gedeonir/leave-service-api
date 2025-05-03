# leave-service - README.md


# Node.js + MongoDB Project

This project is built with Node.js and MongoDB. Follow the steps below to set it up and run on your local machine.

---

## 🚀 Prerequisites

- **Node.js & npm**  
  Download from: [https://nodejs.org/](https://nodejs.org/)  
  Check installation:
  node -v
  npm -v

- **MongoDB**
Download and install from: https://www.mongodb.com/try/download/community
After installing, start the MongoDB server by typing in terminal:

mongod

# Getting Started
- **1. Clone or Download the Project**

git clone <your-project-url>

cd <project-folder>

Or extract the ZIP if it was sent manually.

- **2. Install Dependencies**

npm install

- **3. Configure Environment Variables**
Create a .env file in the root of the project:

MONGODB_URI=mongodb://localhost:27017/your-database-name


Replace your-database-name with the actual name expected by the app.

- **4. Start MongoDB Server**

mongod

- **5. Run the Application**

npm run dev

🌐 Access the App
Once running, open your browser and go to:


http://localhost:3001

- **Troubleshooting**

MongoDB connection error
Make sure mongod is running and the Mongo URI is correct.

Port already in use
Change the PORT in the .env file to a different number.

Missing .env
Don’t forget to create the .env file if it’s not included.