const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.json());

// Connect DB
require('dotenv').config();
mongoose.connect(process.env.DB_URI);

// Generic handling and error handling
const handleError = (err, res, msg = "Error") => {
    console.error(err);
    res.status(400).json({ [msg]: err.message });
  };
  
const handleSuccess = (data, res) => res.status(200).json(data);

// start the server
const travellerServer = express.Router();
app.use(travellerServer);

app.listen(8080, () => {
  console.log("Traveller Server is running on 8080 ...");
});
