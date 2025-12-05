
import http from 'http';

const boundary = '----WebKitFormBoundaryEmptyFileTest';

// Form-data with empty file field
const data = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="name"',
    '',
    'Test User Empty File',
    `--${boundary}`,
    'Content-Disposition: form-data; name="email"',
    '',
    'test.empty@example.com',
    `--${boundary}`,
    'Content-Disposition: form-data; name="phone"',
    '',
    '1234567890',
    `--${boundary}`,
    'Content-Disposition: form-data; name="message"',
    '',
    'Test message empty file field',
    `--${boundary}`,
    'Content-Disposition: form-data; name="blueprint"; filename=""',
    'Content-Type: application/octet-stream',
    '',
    '', // Empty file content
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
