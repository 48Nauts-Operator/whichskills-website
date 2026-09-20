'use strict';
// Table sorting for the census. Numbers sort numerically, everything else as text. No framework, no fetch.
document.querySelectorAll('th[data-sort]').forEach((th, i) => {
  th.addEventListener('click', () => {
    const table = th.closest('table'), body = table.tBodies[0], rows = [...body.rows];
    const asc = !th.classList.contains('asc');
    table.querySelectorAll('th').forEach(h => h.classList.remove('asc', 'desc'));
    th.classList.add(asc ? 'asc' : 'desc');
    const val = r => { const t = r.cells[i].textContent.trim().replace(/,/g, ''); const n = parseFloat(t); return Number.isFinite(n) && /^[\d.]+$/.test(t) ? n : t.toLowerCase(); };
    rows.sort((a, b) => { const x = val(a), y = val(b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * (asc ? 1 : -1); });
    rows.forEach(r => body.appendChild(r));
  });
});

// Clone-flow overlay: click a repo node for the bodies it sourced or took, with credit per copy.
const nd = document.getElementById('node-dialog'), details = (() => { try { return JSON.parse(document.getElementById('clone-details').textContent); } catch { return {}; } })();
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openNode(name) {
  const d = details[name]; if (!d || !nd) return;
  const list = (rows, dir) => rows.map(([skill, other, credited, mirror]) => `<li><code>${esc(skill)}</code> ${dir} <a href="https://github.com/${esc(other)}">${esc(other)}</a> <span class="${mirror ? 'tag-mirror' : credited ? 'tag-ok' : 'tag-no'}">${mirror ? 'same owner' : credited ? 'credited' : 'no credit'}</span></li>`).join('');
  const more = (n, shown) => n > shown ? `<li class="more">and ${n - shown} more in <a href="/data/clones.json">clones.json</a></li>` : '';
  document.getElementById('nd-title').innerHTML = `<a href="https://github.com/${esc(name)}">${esc(name)}</a>`;
  document.getElementById('nd-body').innerHTML =
    (d.sourced_n ? `<h4>${d.sourced_n} bodies other repos took from here</h4><ul>${list(d.sourced, '→')}${more(d.sourced_n, d.sourced.length)}</ul>` : '') +
    (d.taken_n ? `<h4>${d.taken_n} bodies taken from elsewhere</h4><ul>${list(d.taken, '←')}${more(d.taken_n, d.taken.length)}</ul>` : '') +
    `<p class="small">Byte-identical after removing frontmatter and collapsing whitespace. "Credited" means the copy's own text names a source, license or upstream repo. "Same owner" is a mirror under a second org and is not counted as a third-party copy. Renamed or edited copies are not in this list.</p>`;
  nd.showModal();
}
document.querySelectorAll('g.node').forEach(g => { g.addEventListener('click', () => openNode(g.dataset.node)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNode(g.dataset.node); } }); });
if (nd) { document.getElementById('nd-close').onclick = () => nd.close(); nd.addEventListener('click', e => { if (e.target === nd) nd.close(); }); }
