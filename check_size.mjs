import fs from 'fs';
import path from 'path';
const p = path.join(process.cwd(), 'public', 'logo-kecil.png');
const stat = fs.statSync(p);
console.log('Size:', stat.size);
