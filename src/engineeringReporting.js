const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    department: String,
    manager: String,
});

const User = mongoose.model('User', userSchema);

const countReportingToMichael = async () => {
    try {
        console.log('Counting users reporting to Michael...');
        const count = await User.countDocuments({
            department: "Engineering",
            manager: "Michael Phalane"
        });
        console.log(`Total number of people reporting to Michael Phalane: ${count}`);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

module.exports = {
    countReportingToMichael,
};
