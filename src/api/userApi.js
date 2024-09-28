const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config(); 

// Helper function to decrypt user data
function decryptUsersData() {
    const encryptedUsers = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedUsers.iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decryptedData = decipher.update(encryptedUsers.data, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return JSON.parse(decryptedData);  
}

// Helper function to save users data (re-encrypt)
function saveUsersData(users) {
    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encryptedData = cipher.update(JSON.stringify(users), 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    const encryptedUsers = {
        iv: iv.toString('hex'),
        data: encryptedData
    };

    fs.writeFileSync('./data/users.json', JSON.stringify(encryptedUsers));
}

// GET route for retrieving unique users
router.get('/uniqueUsers', (req, res) => {  
    try {
        // Load the unique users data from the JSON file
        const uniqueUsers = JSON.parse(fs.readFileSync('./data/uniqueUsers.json', 'utf8'));
        
        console.log("Unique Users:", uniqueUsers); 

        // Check if uniqueUsers is an array
        if (!Array.isArray(uniqueUsers)) {
            return res.status(400).json({ message: 'Unique users data is not an array' });
        }

        // Send the unique users as the response
        res.json({ uniqueUsers: uniqueUsers });

    } catch (error) {
        console.error("Error reading unique users:", error); 
        res.status(500).json({ message: 'Failed to retrieve unique users', error: error.message });
    }
});


// Task 3: Get Users Ordered by Department and Designation
router.get('/orderedUsers', (req, res) => {
    try {
        const users = decryptUsersData();

        const orderedUsers = users.sort((a, b) => {
            if (a.department === b.department) {
                return a.designation.localeCompare(b.designation);
            }
            return a.department.localeCompare(b.department);
        });

        res.json({ orderedUsers });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve ordered users', error: error.message });
    }
});

// Add New User
router.post('/addUser', (req, res) => {
    try {
        const newUser = req.body;
        const users = decryptUsersData();
        users.push(newUser);

        saveUsersData(users);  
        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add new user', error: error.message });
    }
});

// Update Existing User
router.put('/updateUser', (req, res) => {
    try {
        const { email, updates } = req.body;
        let users = decryptUsersData();

        const userIndex = users.findIndex(user => user.email === email);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        users[userIndex] = { ...users[userIndex], ...updates };

        saveUsersData(users);
        res.json({ message: 'User updated successfully', user: users[userIndex] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
});

module.exports = router;
