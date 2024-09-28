const crypto = require('crypto');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

// Decrypt user data
function decryptUserData(encryptedUsers) {
    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedUsers.iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decryptedData = decipher.update(encryptedUsers.data, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return JSON.parse(decryptedData); // Return the decrypted users as an array
}

// Read a JSON file and parse its content
function readFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Create unique users file
function createUniqueUsersFile(token) { 
    try {
        const encryptedUsers = readFile('./data/users.json');
        const users = decryptUserData(encryptedUsers); 

        if (!Array.isArray(users) || users.length === 0) {
            console.log('No users found after decryption. Unique users file will not be created.');
            return; 
        }

        const uniqueUsers = new Map(); 

        users.forEach(user => {
            const uniqueKey = user.name + user.surname; 
            if (!uniqueUsers.has(uniqueKey)) {
                // Add UUID for each unique user and include the token
                const userWithId = { ...user, id: uuidv4(), token };
                uniqueUsers.set(uniqueKey, userWithId); 
            }
        });

        // Convert the Map back to an array
        const uniqueUsersArray = Array.from(uniqueUsers.values());

        // Check if uniqueUsers array is not empty before writing to file
        if (uniqueUsersArray.length > 0) {
            fs.writeFileSync('./data/uniqueUsers.json', JSON.stringify(uniqueUsersArray, null, 2));
            console.log('Unique users file created successfully with ' + uniqueUsersArray.length + ' unique users.');
        } else {
            console.log('No unique users found, file not created.');
        }
    } catch (error) {
        console.error('Error during unique users creation:', error.message);
    }
}

// Export functions
module.exports = {
    decryptUserData,
    createUniqueUsersFile,
    readFile,
};
