require('dotenv').config({ path: './.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
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

// Generic handling and error handling
const handleError = (err, res, msg = "Error") => {
    console.error(err);
    res.status(400).json({ [msg]: err.message });
  };

const handleSuccess = (data, res) => res.status(200).json(data);

// Add a status check route
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
const travellerServer = express.Router();
app.use(travellerServer);

app.listen(process.env.PORT, () => {
  console.log(`Traveller Server is running on ${process.env.PORT} ...`);
});
