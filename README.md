# testProject
Nodejs project for employees in a mine

testProject - Node.js Backend
Description
This is a Node.js backend API for handling user data, including encryption, user management, and unique user retrieval. It supports various endpoints for user management, such as adding, updating, and retrieving users in an encrypted format.

Features
AES-256-CBC encryption for user data
Retrieve unique users
Add new users
Update existing users
Sort users by department and designation
Prerequisites
Before running the project, make sure you have the following installed:

Node.js (v14.x or higher)
npm (v6.x or higher)
Setup Instructions
Clone the repository:

bash
Copy code
git clone https://github.com/samsonbhila/testProject.git
Navigate to the project directory:

bash
Copy code
cd testProject
Install dependencies:

bash
Copy code
npm install
Create an environment file (.env):

Create a .env file at the root of your project and add the following variables:

bash
Copy code
ENCRYPTION_KEY=your_256_bit_key_here
Ensure that the encryption key is a 256-bit (32-byte) hexadecimal key. You can generate one using the following command in Node.js:

javascript
Copy code
crypto.randomBytes(32).toString('hex')
Run the project:

Start the Node.js server using the following command:

bash
Copy code
npm start
The server will start on http://localhost:3000.

API Endpoints
1. Get Unique Users
Endpoint: /api/uniqueUsers
Method: GET
Description: Retrieves a list of unique users from uniqueUsers.json.
2. Get Users Ordered by Department and Designation
Endpoint: /api/orderedUsers
Method: GET
Description: Retrieves users ordered by department and designation.
3. Add a New User
Endpoint: /api/addUser
Method: POST
Description: Adds a new user to the system.
Body Parameters:
json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "department": "HR",
    "designation": "Manager"
}

4. Update an Existing User
Endpoint: /api/updateUser
Method: PUT
Description: Updates an existing user.
