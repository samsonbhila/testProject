const fs = require('fs');
const { parse } = require('json2csv');
const { readFile } = require('./fileHandler'); 

function generateCSV() {
  const uniqueUsers = readFile('./data/uniqueUsers.json'); 

  // Create a writable stream for the CSV file
  const csvStream = fs.createWriteStream('./data/users.csv');
  const fields = ['Name', 'Surname', 'Number of Times Duplicated'];
  
  // Write CSV header
  csvStream.write(`${fields.join(',')}\n`);

  // Stream each user data
  for (const user of uniqueUsers) {
    const csvLine = `${user.name},${user.surname},${user.count}\n`; 
    csvStream.write(csvLine);
  }

  // Close the stream
  csvStream.end(() => {
    console.log('CSV file created successfully.');
  });
}

module.exports = { generateCSV };
