'use strict';
// Skill index: 18k rows, client-side search, filters, header sorting, pagination. Data loads once from /data/skills-index.json.
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PAGE = 50;
let rows = [], view = [], page = 1, sortKey = 'n', sortDir = 1;
const params = new URLSearchParams(location.search);
const state = { q: params.get('q') || '', repo: params.get('repo') || '', type: 'all', prov: 'all', flagged: false, judged: false };
const ghFile = r => r.k === 'm' ? `https://github.com/${r.r}/tree/${r.c}/${r.p.replace(/\/@plugin$/, '')}` : `https://github.com/${r.r}/blob/${r.c}/${r.p}/SKILL.md`;
const prov = r => r.o ? `copy of <a href="https://github.com/${esc(r.o)}">${esc(r.o)}</a> <small>${r.ok === 'f' ? 'first party' : 'earliest known'} · ${r.oa ? 'credited' : 'no credit'}</small>` : r.cp ? `original <small>· ${r.cp} ${r.cp === 1 ? 'copy' : 'copies'} elsewhere</small>` : '<small>—</small>';
const risk = r => r.j == null ? '<small>—</small>' : `<b>${r.j.toFixed(2)}</b> <small>${esc(r.jk)}</small>`;
const num = v => (v == null ? -1 : v);
const sorters = { n: (a, b) => a.n.localeCompare(b.n), r: (a, b) => a.r.localeCompare(b.r) || a.p.localeCompare(b.p), f: (a, b) => a.f - b.f, j: (a, b) => num(a.j) - num(b.j), b: (a, b) => a.b - b.b, o: (a, b) => num(a.cp) - num(b.cp) };

function apply() {
  const q = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  view = rows.filter(r => {
    if (state.repo && r.r !== state.repo) return false;
    if (state.type === 's' && r.k !== 's') return false;
    if (state.type === 'm' && r.k !== 'm') return false;
    if (state.prov === 'orig' && !r.cp) return false;
    if (state.prov === 'copy' && !r.o) return false;
    if (state.prov === 'unique' && (r.o || r.cp)) return false;
    if (state.flagged && !r.f) return false;
    if (state.judged && r.j == null) return false;
    if (q.length) { const hay = (r.n + ' ' + r.r + ' ' + r.p + ' ' + r.d).toLowerCase(); if (!q.every(t => hay.includes(t))) return false; }
    return true;
  });
  view.sort((a, b) => sorters[sortKey](a, b) * sortDir || a.n.localeCompare(b.n));
  page = Math.min(page, Math.max(1, Math.ceil(view.length / PAGE)));
  render();
  const u = new URL(location); state.q ? u.searchParams.set('q', state.q) : u.searchParams.delete('q'); state.repo ? u.searchParams.set('repo', state.repo) : u.searchParams.delete('repo'); history.replaceState(null, '', u);
}

function render() {
  const start = (page - 1) * PAGE, slice = view.slice(start, start + PAGE);
  $('count').textContent = `${view.length.toLocaleString('en-US')} of ${rows.length.toLocaleString('en-US')} rows`;
  $('rows').innerHTML = slice.map(r => `<tr><td><a href="${ghFile(r)}"><code>${esc(r.n)}</code></a>${r.k === 'm' ? ' <span class="mini">plugin manifest</span>' : ''}<br><small>${esc(r.p)}</small></td><td><a href="https://github.com/${esc(r.r)}/tree/${esc(r.c)}">${esc(r.r)}</a><br><small>@ ${esc(r.c)}</small></td><td class="desc">${esc(r.d)}</td><td>${prov(r)}</td><td class="num">${r.f || '<small>—</small>'}</td><td class="num">${risk(r)}</td><td class="num">${(r.b / 1000).toFixed(1)}k</td></tr>`).join('') || '<tr><td colspan="7" class="empty">Nothing matches. Try fewer words.</td></tr>';
  const pages = Math.max(1, Math.ceil(view.length / PAGE));
  $('pager').innerHTML = `<button id="prev" ${page <= 1 ? 'disabled' : ''}>←</button><span>page ${page} of ${pages}</span><button id="next" ${page >= pages ? 'disabled' : ''}>→</button>`;
  $('prev').onclick = () => { page--; render(); scrollTop(); }; $('next').onclick = () => { page++; render(); scrollTop(); };
  document.querySelectorAll('th[data-key]').forEach(th => { th.classList.toggle('asc', th.dataset.key === sortKey && sortDir === 1); th.classList.toggle('desc', th.dataset.key === sortKey && sortDir === -1); });
}
const scrollTop = () => $('index').scrollIntoView({ block: 'start' });

document.querySelectorAll('th[data-key]').forEach(th => th.addEventListener('click', () => { const k = th.dataset.key; sortDir = sortKey === k ? -sortDir : (k === 'n' || k === 'r' ? 1 : -1); sortKey = k; page = 1; apply(); }));
$('q').addEventListener('input', e => { state.q = e.target.value; page = 1; apply(); });
$('repo').addEventListener('change', e => { state.repo = e.target.value; page = 1; apply(); });
$('type').addEventListener('change', e => { state.type = e.target.value; page = 1; apply(); });
$('prov').addEventListener('change', e => { state.prov = e.target.value; page = 1; apply(); });
$('flagged').addEventListener('change', e => { state.flagged = e.target.checked; page = 1; apply(); });
$('judged').addEventListener('change', e => { state.judged = e.target.checked; page = 1; apply(); });

fetch('/data/skills-index.json').then(r => r.json()).then(d => {
  rows = d.rows;
  const repos = [...new Set(rows.map(r => r.r))].sort((a, b) => a.localeCompare(b));
  $('repo').innerHTML = '<option value="">All repos</option>' + repos.map(r => `<option value="${esc(r)}" ${r === state.repo ? 'selected' : ''}>${esc(r)}</option>`).join('');
  $('q').value = state.q; $('loading').hidden = true; $('index').hidden = false;
  apply();
}).catch(() => { $('loading').textContent = 'The index could not be loaded. Reload the page.'; });
