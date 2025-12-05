
import http from 'http';

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const data = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="name"',
    '',
    'Test User',
    `--${boundary}`,
    'Content-Disposition: form-data; name="email"',
    '',
    'test@example.com',
    `--${boundary}`,
    'Content-Disposition: form-data; name="phone"',
    '',
    '1234567890',
    `--${boundary}`,
    'Content-Disposition: form-data; name="message"',
    '',
    'Test message via multipart script',
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
