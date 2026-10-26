// Helper for the Practical 12 demo.
//   npm run demo:break  -> changes expected status in the CI-DEMO test (200 -> 404) so it FAILS
//   npm run demo:fix    -> restores it (404 -> 200) so it PASSES
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'tests', 'tasks.test.js');
const mode = process.argv[2];
const GOOD = 'expect(res.statusCode).toBe(200); // CI-DEMO';
const BAD = 'expect(res.statusCode).toBe(404); // CI-DEMO';

let src = fs.readFileSync(file, 'utf8');
if (mode === 'break') src = src.replace(GOOD, BAD);
else if (mode === 'fix') src = src.replace(BAD, GOOD);
else {
  console.error('Usage: node scripts/toggle-test.js break|fix');
  process.exit(1);
}
fs.writeFileSync(file, src);
console.log(mode === 'break' ? 'Test deliberately broken (expects 404).' : 'Test fixed (expects 200).');
