
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'large_test.pdf');
const sizeInBytes = 10 * 1024 * 1024; // 10MB

const buffer = Buffer.alloc(sizeInBytes, 'a'); // Fill with 'a'

fs.writeFileSync(filePath, buffer);
console.log(`Created 10MB file at ${filePath}`);
