const fs = require('fs');
const User = require('./models/User');

const insertUsersFromFile = async () => {
    try {
        const data = fs.readFileSync('./data/uniqueUsers.json', 'utf8');
        const users = JSON.parse(data);

        // Insert users into MongoDB
        await User.insertMany(users);
        console.log('Users inserted successfully.');
    } catch (error) {
        console.error('Error inserting users:', error);
    }
};

insertUsersFromFile();
