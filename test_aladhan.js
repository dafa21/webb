async function test() {
  const res = await fetch('https://api.aladhan.com/v1/timings?latitude=-6.2&longitude=106.8&method=20');
  const data = await res.json();
  console.log(data);
}
test();
