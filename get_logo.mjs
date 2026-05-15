import https from 'https';

function getFinalUrl(url) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      getFinalUrl(res.headers.location);
    } else {
      console.log('Final URL:', url, 'Status:', res.statusCode);
      if (res.statusCode === 200) {
        console.log('Valid image!');
      }
    }
  });
}
getFinalUrl('https://www.laznasdewandakwah.or.id/img/logo/logo-kecil.png');
