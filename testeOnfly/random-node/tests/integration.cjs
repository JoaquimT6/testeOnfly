// Node's built-in test runner (no extra deps)
const test = require('node:test');
const assert = require('node:assert/strict');
const https = require('node:https');

function fetchPlain(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

test('random.org returns an integer within range', async () => {
  const min = parseInt(process.env.MIN || '1', 10);
  const max = parseInt(process.env.MAX || '60', 10);
  const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
  const res = await fetchPlain(url);
  const n = parseInt(String(res).trim(), 10);
  assert.ok(Number.isInteger(n), 'response is integer');
  assert.ok(n >= min && n <= max, `in range [${min}, ${max}]`);
});
