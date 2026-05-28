import https from 'https';
import fs from 'fs';
import path from 'path';

const url = 'https://laznasdewandakwah.or.id/img/logo/logo-kecil.png';
const dest = path.join(process.cwd(), 'public', 'logo-kecil.png');

fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });

const file = fs.createWriteStream(dest);

https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();  // close() is async, call cb after close completes.
    console.log("Done");
  });
}).on('error', function(err) { // Handle errors
  fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
  console.log("Error:", err);
});
