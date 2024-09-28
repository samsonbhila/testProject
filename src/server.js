const axios = require('axios');
const querystring = require('querystring');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const crypto = require('crypto');
const fs = require('fs');
const express = require('express');
const userAPI = require('./api/userApi'); 
const dotenv = require('dotenv'); 
const { createUniqueUsersFile } = require('./utils/fileHandler');
const { generateCSV } = require('./utils/csvGenerator');
const { postUsers } = require('./utils/postData');
const { countReportingToMichael } = require('./engineeringReporting');
const { startWebSocketClient } = require('./webSocketClient');
//const { insertUsersFromFile } = require('./insertUsers');

// Load environment variables from .env file
dotenv.config();

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// Form data with credentials from .env file
const formData = {
  username: process.env.LOGIN_USERNAME, 
  password: process.env.PASSWORD,       
  action: 'LOGIN',
};

// Define rate-limiting (100 requests per hour)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 100, 
  message: "Too many attempts, please try again later.",
});

// Initialize Express app
const app = express();
const port = 3000;

app.use('/api', userAPI);
// Variable to store session token
let sessionToken;

// Simulate HTTPS form submission
async function simulateLogin() {
  try {
    const url = 'https://challenge.sedilink.co.za:12022';

    // Make a POST request
    const response = await axios.post(
      url,
      querystring.stringify(formData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Receive session token and list of users
    if (response.data && response.data.token) {
      sessionToken = response.data.token; 
      console.log('Login successful');
      console.log('Session token:', sessionToken);

      // Encrypt and store users
      storeUsersEncrypted(response.data.users);

      // Create unique users file
      await createUniqueUsersFile(sessionToken); 
      await postUsers(sessionToken, response.data.users);
      //await insertUsersFromFile();
     
      await countReportingToMichael();
      startWebSocketClient();     

    } else {
      console.log('Login failed: Invalid response from the server');
    }
  } catch (error) {
    handleAxiosError(error);
  }
}

// Encrypt user data and store in users.json
function storeUsersEncrypted(users) {
  const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); 
  const iv = crypto.randomBytes(16); 

  // Convert users array to string
  const usersData = JSON.stringify(users);

  // Encrypt user data
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  let encryptedData = cipher.update(usersData, 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  // Store the encrypted data and key 
  const encryptedUsers = {
    iv: iv.toString('hex'),
    data: encryptedData,
  };

  fs.writeFileSync('./data/users.json', JSON.stringify(encryptedUsers));
  console.log('User data encrypted and saved.');
}

// Handle Axios errors
function handleAxiosError(error) {
  if (error.response) {
    console.log('Error Response Data:', error.response.data);
    console.log('Error Response Status:', error.response.status);
    console.log('Error Response Headers:', error.response.headers);
  } else if (error.request) {
    
    console.log('No response received:', error.request);
  } else {
    console.log('Error:', error.message);
  }
}

// Decrypt and serve the users.json file
app.get('/users', (req, res) => {
  try {
    const encryptedUsers = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

    const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedUsers.iv, 'hex');

    // Decrypt user data
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decryptedData = decipher.update(encryptedUsers.data, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    const users = JSON.parse(decryptedData);

    // Send decrypted users data and response
    res.json({
      sessionToken: sessionToken, 
      users: users 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to decrypt or read users data', error: error.message });
  }
});

// Simulate login process 
simulateLogin();

// Endpoint to create unique users file
app.get('/create-unique-users', (req, res) => {
  createUniqueUsersFile();
  res.send('Unique users file created.');
});

// Endpoint to generate CSV
app.get('/generate-csv', (req, res) => {
  generateCSV();
  res.send('CSV file created.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
