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

        // Check if all required fields are present in the request body
        if (!newUser.name || !newUser.surname || !newUser.department || !newUser.designation) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Decrypt existing users
        const users = decryptUsersData();

        // Add new user to the array
        users.push(newUser);

        // Re-encrypt and save users data
        saveUsersData(users);

        // Also update uniqueUsers.json
        const uniqueUsers = JSON.parse(fs.readFileSync('./data/uniqueUsers.json', 'utf8'));
        uniqueUsers.push(newUser);
        fs.writeFileSync('./data/uniqueUsers.json', JSON.stringify(uniqueUsers));

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add new user', error: error.message });
    }
});


// Update user endpoint
router.put('/updateUser/:id', (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from URL
        const { name, surname, department, designation } = req.body; // Destructure request body

        // Decrypt existing users
        const users = decryptUsersData();

        // Find the user by ID
        const userIndex = users.findIndex(user => user.id === userId);

        // Check if user exists
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user details
        users[userIndex] = {
            ...users[userIndex], // keep existing properties
            name,
            surname,
            department,
            designation
        };

        // Re-encrypt and save users data
        saveUsersData(users);

        return res.json({ message: 'User updated successfully', user: users[userIndex] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
});

module.exports = router;
