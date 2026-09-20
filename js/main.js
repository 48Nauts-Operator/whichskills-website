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
