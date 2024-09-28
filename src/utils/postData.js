require('dotenv').config(); 
const fs = require('fs');
const axios = require('axios');

const API_URL = 'https://challenge.sedilink.co.za:12022';
const MAX_RETRIES = 3; 

async function postUserData(user) {
  // Ensure user object contains all necessary fields
  const payload = {
    action: 'ADDUSER',  
    name: user.name,
    surname: user.surname,
    designation: user.designation, 
    department: user.department, 
    id: user.id, 
    token: user.token, 
  };

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const response = await axios.post(API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`User ${user.name} ${user.surname} posted successfully:`, response.data);
      return response.data; 
    } catch (error) {
      attempts++;
      console.error(`Failed to post user ${user.name} ${user.surname}. Attempt ${attempts} of ${MAX_RETRIES}. Error: ${error.message}`);
      
      // Log additional error details if available
      if (error.response) {
        console.error(`Response Status: ${error.response.status}`);
        console.error(`Response Data:`, error.response.data);
      }

      if (attempts >= MAX_RETRIES) {
        console.error(`Failed to post user ${user.name} ${user.surname} after ${MAX_RETRIES} attempts.`);
      }

      // Exponential backoff strategy for retries
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
}

async function postUsers() {
  try {
    const uniqueUsers = JSON.parse(fs.readFileSync('./data/uniqueUsers.json', 'utf-8')); // Read the JSON file

    for (const user of uniqueUsers) {
      await postUserData(user); 
    }
  } catch (error) {
    console.error('Error reading users data or posting:', error.message);
  }
}

// Export the postUsers function
module.exports = { postUsers };
