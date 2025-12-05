
import http from 'http';

const boundary = '----WebKitFormBoundaryWrongKey';

// Form-data with WRONG file key
const data = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="name"',
    '',
    'Test User Wrong Key',
    `--${boundary}`,
    'Content-Disposition: form-data; name="email"',
    '',
    'test.wrong@example.com',
    `--${boundary}`,
    'Content-Disposition: form-data; name="phone"',
    '',
    '1234567890',
    `--${boundary}`,
    'Content-Disposition: form-data; name="message"',
    '',
    'Test message wrong key',
    `--${boundary}`,
    'Content-Disposition: form-data; name="WRONG_KEY"; filename="test.txt"', // Incorrect key
    'Content-Type: text/plain',
    '',
    'This is a test blueprint file content.',
    `--${boundary}--`
].join('\r\n');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/send-email',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(data)
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
