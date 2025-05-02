// leave-service/src/index.js
const express = require('express');
const app = express();
const leaveRoutes = require('./routes/leaveRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const teamRoutes = require('./routes/teamRoutes');
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const cron = require('node-cron');
const accrueLeave = require('./cron/acrual');
app.use(express.json());
const dbConnect = require("../config/database");
const dotenv = require("dotenv").config();

app.use(cors());
// Routes
app.use('/api/leaves', leaveRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/team', teamRoutes);


// Run on 1st of each month at midnight
cron.schedule('0 0 1 * *', accrueLeave);

// Root test route
app.get('/', (req, res) => {
  res.send('Leave Management API is running');
});

app.get('/', (req, res) => {
  res.send('Leave Management Service is running');
});

dbConnect().then(()=>{
  console.log("Database connected sucessfully");
  const server=app.listen(PORT, () => {
    app.emit("Started");
    console.log(`Server is running  at PORT ${PORT}`);
  })
  // socket.socketMethod.socketStarter(server)
});
