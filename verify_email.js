import http from 'http';
import fs from 'fs';

const data = JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    message: "Test message from verification script"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/send-email',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        try {
            const json = JSON.parse(responseBody);
            if (json.error) {
                fs.writeFileSync('error.log', json.error);
                console.log('Error written to error.log');
            } else {
                console.log('Response:', responseBody);
            }
        } catch (e) {
            console.log('Raw Response:', responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
