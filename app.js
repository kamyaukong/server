require('dotenv').config({ path: './.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const customError = require('./customError');
const app = express();


const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect DB
const MONGODB_URI = process.env.MONGODB_URI;

// Make Async connection to Mongo
const connectToMongoDB = async () => {
  try {
      await mongoose.connect(MONGODB_URI);
      console.log("DB connected...");
  } catch (error) {
      console.error("Failed to connect to MongoDB:", error.message);
  }
};

// Listen for connection errors
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

// Listen for disconnected event
mongoose.connection.on('disconnected', () => {
  console.warn("MongoDB connection lost. Attempting to reconnect...");
  connectToMongoDB();  // reconnect automatically
});

connectToMongoDB();

// Route: Users, Itinerary
app.use('/api/v1/users', require('./routers/users/users.controller'));
app.use('/api/v1/itinerary', require('./routers/itinerary/itinerary.controller'));

// Global error handling
app.use((err, req, res, next) => {
  if(err instanceof customError){
    return res.status(err.statusCode).json({error: err.message});
  }
})

// Route: status check
app.get('/status', (req, res) => {
  const mongooseState = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting ...',
    3: 'Disconnecting',
  };
  // output the message
  const responseMessage = `MongoDB status: ${statusMap[mongooseState] || 'Unknown state'}\nNode.JS server: running on port ${process.env.PORT}`;
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(responseMessage);
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Traveller Server is running on ${process.env.PORT} ...`);
});
