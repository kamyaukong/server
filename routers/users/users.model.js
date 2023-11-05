const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Users = new Schema({
    userID:{ type:String },
    dob: { type: Date} ,
    email: { type:String },
    password: { type:String }
});

module.exports = mongoose.model('Users', Users);