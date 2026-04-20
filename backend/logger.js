const fs = require('fs');
const path = require('path');

const LOG_FILE = process.env.LOG_FILE || path.join(__dirname, 'data', 'events.jsonl');

function append(event) {
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify({ ...event, at: Date.now() }) + '\n');
  } catch (err) {
    console.error('Logger error:', err.message);
  }
}

function readAll() {
  try {
    return fs.readFileSync(LOG_FILE, 'utf-8')
      .trim().split('\n').filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

module.exports = { append, readAll };
