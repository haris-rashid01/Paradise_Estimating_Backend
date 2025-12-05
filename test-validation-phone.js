import * as controller from './src/controllers/contactController.js';

// Mock req with missing phone
const req = {
  body: {
      name: "Test",
      email: "test@example.com",
      message: "Hello"
      // phone is missing
  }
};

const res = {
  status: (code) => {
    console.log(`Status: ${code}`);
    return {
      json: (data) => console.log('Response:', data)
    };
  }
};

console.log('Testing missing phone...');
controller.sendEmail(req, res).catch(err => console.error(err));
