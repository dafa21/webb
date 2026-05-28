import https from 'https';
https.get('https://api.aladhan.com/v1/timings?latitude=-6.2&longitude=106.8&method=20', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Data:', data.substring(0, 300)));
});
