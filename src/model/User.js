const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    department: String,
    manager: String,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
