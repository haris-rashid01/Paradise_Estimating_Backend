
import http from 'http';

const data = JSON.stringify({
    name: "Test User JSON",
    email: "test.json@example.com",
    phone: "1234567890",
    message: "Test message via JSON"
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
        console.log('Response Body:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
