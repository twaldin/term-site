const express = require('express');
const { readAll } = require('./logger');

const router = express.Router();

function basicAuth(req, res, next) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return res.status(503).send('ADMIN_PASSWORD not set.');

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="term-site admin"');
    return res.status(401).send('Authentication required.');
  }

  const [user, pass] = Buffer.from(header.slice(6), 'base64').toString().split(':');
  const email = process.env.ADMIN_EMAIL || 'timothy@waldin.net';
  if (user !== email || pass !== password) {
    res.set('WWW-Authenticate', 'Basic realm="term-site admin"');
    return res.status(401).send('Invalid credentials.');
  }
  next();
}

function groupSessions(events) {
  const sessions = new Map();
  for (const e of events) {
    if (e.type === 'session_start') {
      sessions.set(e.id, { ...e, commands: [] });
    } else if (e.type === 'command') {
      sessions.get(e.id)?.commands.push({ cmd: e.cmd, at: e.at });
    } else if (e.type === 'session_end') {
      const s = sessions.get(e.id);
      if (s) { s.endedAt = e.at; s.endReason = e.reason; }
    }
  }
  return [...sessions.values()].sort((a, b) => b.at - a.at);
}

function refBadge(ref) {
  if (!ref) return '<span class="badge direct">direct</span>';
  if (/t\.co|twitter\.com|x\.com/.test(ref)) return '<span class="badge tw">twitter/x</span>';
  if (/linkedin\.com/.test(ref)) return '<span class="badge li">linkedin</span>';
  if (/news\.ycombinator|gcombinator/.test(ref)) return '<span class="badge hn">HN</span>';
  if (/github\.com/.test(ref)) return '<span class="badge gh">github</span>';
  if (/reddit\.com/.test(ref)) return '<span class="badge rd">reddit</span>';
  return `<span class="badge other" title="${esc(ref)}">ref</span>`;
}

function fmtDuration(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function fmtTime(ts) {
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shortUA(ua) {
  if (!ua) return '—';
  if (/iPhone|Android/.test(ua)) return '📱 ' + (ua.match(/(iPhone|Android[^;)]+)/) || [''])[0];
  if (/Macintosh/.test(ua)) return '🖥 Mac';
  if (/Windows/.test(ua)) return '🖥 Win';
  if (/Linux/.test(ua)) return '🖥 Linux';
  return ua.slice(0, 40);
}

function shortRef(ref) {
  if (!ref) return '—';
  try { return new URL(ref).hostname.replace(/^www\./, ''); } catch { return ref.slice(0, 40); }
}

router.use(basicAuth);

router.get('/api/sessions', (req, res) => {
  res.json(groupSessions(readAll()));
});

router.get('/', (req, res) => {
  const events = readAll();
  const sessions = groupSessions(events);

  const uniqueIPs = new Set(sessions.map(s => s.ip)).size;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = sessions.filter(s => new Date(s.at).toISOString().startsWith(today)).length;
  const totalCmds = events.filter(e => e.type === 'command').length;

  const rows = sessions.map((s, i) => {
    const dur = s.endedAt ? fmtDuration(s.endedAt - s.at) : '…live';
    const cmdRows = s.commands.map(c =>
      `<div class="cmd-row"><span class="t">${fmtTime(c.at)}</span><span class="cmd">$ ${esc(c.cmd)}</span></div>`
    ).join('');
    const cmdBlock = s.commands.length
      ? `<tr class="cmd-block" id="b${i}"><td colspan="7"><div class="cmds">${cmdRows || '<span class="dim">no commands logged</span>'}</div></td></tr>`
      : '';

    return `
      <tr class="row" onclick="toggle(${i})">
        <td class="t">${fmtTime(s.at)}</td>
        <td class="ip">${esc(s.ip)}</td>
        <td>${refBadge(s.referrer)} <span class="dim">${esc(shortRef(s.referrer))}</span></td>
        <td class="cmd">${s.initCommand ? esc(s.initCommand) : '<span class="dim">welcome</span>'}</td>
        <td>${esc(shortUA(s.ua))}</td>
        <td class="dur">${dur}</td>
        <td class="cnt">${s.commands.length}</td>
      </tr>${cmdBlock}`;
  }).join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Sessions — tim.waldin.net</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#c9d1d9;font:12px/1.5 'Menlo','Monaco','Courier New',monospace;padding:24px}
h1{color:#58a6ff;font-size:15px;margin-bottom:16px}
.stats{display:flex;gap:28px;margin-bottom:20px;padding:12px 16px;background:#161b22;border:1px solid #21262d}
.stat{color:#8b949e;font-size:11px}.stat strong{color:#e6edf3;font-size:20px;display:block}
input{background:#161b22;border:1px solid #30363d;color:#c9d1d9;padding:5px 10px;font:12px monospace;width:280px;margin-bottom:16px}
input:focus{outline:1px solid #388bfd}
table{width:100%;border-collapse:collapse}
th{color:#8b949e;font-size:11px;text-align:left;padding:5px 8px;border-bottom:1px solid #21262d;white-space:nowrap}
tr.row{cursor:pointer}tr.row:hover td{background:#161b22}
td{padding:5px 8px;border-bottom:1px solid #161b22;vertical-align:middle;white-space:nowrap}
.t{color:#6e7681;font-size:11px}.ip{color:#79c0ff}.cmd{color:#d2a8ff}
.dur{color:#8b949e}.cnt{color:#6e7681;text-align:right}
.dim{color:#6e7681}
tr.cmd-block{display:none}tr.cmd-block.open{display:table-row}
.cmds{padding:10px 16px;background:#0d1117;border-left:3px solid #21262d}
.cmd-row{padding:2px 0}.cmd-row .t{margin-right:10px}
.badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:bold;margin-right:4px}
.tw{background:#1d9bf020;color:#1d9bf0;border:1px solid #1d9bf040}
.li{background:#0a66c220;color:#70b5f9;border:1px solid #0a66c240}
.hn{background:#ff660020;color:#ff6600;border:1px solid #ff660040}
.gh{background:#33333380;color:#ccc;border:1px solid #555}
.rd{background:#ff450020;color:#ff4500;border:1px solid #ff450040}
.direct{background:#30363d;color:#8b949e;border:1px solid #444}
.other{background:#21262d;color:#8b949e;border:1px solid #30363d}
</style>
</head>
<body>
<h1>▸ sessions</h1>
<div class="stats">
  <div class="stat"><strong>${sessions.length}</strong>total sessions</div>
  <div class="stat"><strong>${uniqueIPs}</strong>unique IPs</div>
  <div class="stat"><strong>${todayCount}</strong>today</div>
  <div class="stat"><strong>${totalCmds}</strong>commands typed</div>
</div>
<input type="text" id="q" placeholder="filter by IP, referrer, command…" oninput="filter()">
<table>
<thead><tr>
  <th>time (UTC)</th><th>IP</th><th>referrer</th><th>init command</th><th>device</th><th>duration</th><th>#cmds</th>
</tr></thead>
<tbody id="body">${rows}</tbody>
</table>
<script>
function toggle(i){
  var b=document.getElementById('b'+i);
  if(b)b.classList.toggle('open');
}
function filter(){
  var q=document.getElementById('q').value.toLowerCase();
  document.querySelectorAll('tr.row').forEach(function(r,i){
    var show=!q||r.textContent.toLowerCase().includes(q);
    r.style.display=show?'':'none';
    var b=document.getElementById('b'+i);
    if(b)b.style.display=show&&b.classList.contains('open')?'table-row':'none';
  });
}
</script>
</body>
</html>`);
});

module.exports = router;
