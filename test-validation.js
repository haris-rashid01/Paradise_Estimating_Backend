import * as controller from './src/controllers/contactController.js';

// Mock req with empty body
const req = {
  body: {}
};

const res = {
  status: (code) => {
    console.log(`Status: ${code}`);
    return {
      json: (data) => console.log('Response:', data)
    };
  }
};

console.log('Testing empty body...');
controller.sendEmail(req, res).catch(err => console.error(err));
