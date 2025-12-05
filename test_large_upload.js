
import http from 'http';
import fs from 'fs';
import path from 'path';

const boundary = '----WebKitFormBoundaryLargeFileTest';
const filePath = path.join(process.cwd(), 'large_test.pdf');
const fileStats = fs.statSync(filePath);

const header = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="name"',
    '',
    'Test User Large File',
    `--${boundary}`,
    'Content-Disposition: form-data; name="email"',
    '',
    'test.large@example.com',
    `--${boundary}`,
    'Content-Disposition: form-data; name="phone"',
    '',
    '1234567890',
    `--${boundary}`,
    'Content-Disposition: form-data; name="message"',
    '',
    'Test message with 10MB file',
    `--${boundary}`,
    `Content-Disposition: form-data; name="blueprint"; filename="large_test.pdf"`,
    'Content-Type: application/pdf',
    '',
    ''
].join('\r\n');

const footer = `\r\n--${boundary}--`;

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/send-email',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(header) + fileStats.size + Buffer.byteLength(footer)
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

// Write header
req.write(header);

// Stream file
const fileStream = fs.createReadStream(filePath);
fileStream.pipe(req, { end: false });

fileStream.on('end', () => {
    req.write(footer);
    req.end();
});
