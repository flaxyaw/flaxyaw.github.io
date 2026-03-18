'use strict';

// ── Page routing ─────────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('SA').scrollTop = 0;

  // Show/hide contextual nav buttons
  const navBtns = ['btnExport', 'btnImport', 'btnAddAcc', 'btnAddRec', 'btnAddBud'];
  navBtns.forEach(id => { document.getElementById(id).style.display = 'none'; });

  const fab = document.getElementById('fab');
  switch (name) {
    case 'transactions':
      ['btnExport', 'btnImport'].forEach(id => { document.getElementById(id).style.display = ''; });
      fab.style.display = 'flex';
      renderLedger();
      break;
    case 'accounts':
      document.getElementById('btnAddAcc').style.display = '';
      fab.style.display = 'none';
      renderAccs();
      break;
    case 'recurring':
      document.getElementById('btnAddRec').style.display = '';
      fab.style.display = 'none';
      renderRecs();
      break;
    case 'budgets':
      document.getElementById('btnAddBud').style.display = '';
      fab.style.display = 'none';
      renderBuds();
      break;
    default: // overview
      fab.style.display = 'flex';
  }
}

// ── FAB (tap = new expense, long-press = quick menu) ─────────────────────────
let fabLong = false;
let fabTimer = null;

function closeQM() {
  document.getElementById('QM').classList.remove('open');
  fabLong = false;
}

const fabEl = document.getElementById('fab');

fabEl.addEventListener('touchstart', () => {
  fabTimer = setTimeout(() => {
    fabLong = true;
    document.getElementById('QM').classList.add('open');
    if (navigator.vibrate) navigator.vibrate(25);
  }, 420);
}, { passive: true });

fabEl.addEventListener('touchend', () => {
  clearTimeout(fabTimer);
  if (!fabLong) openAddTx();
  fabLong = false;
}, { passive: true });

// Fallback for desktop (click)
fabEl.addEventListener('click', () => {
  if (!fabLong) openAddTx();
});

// Close quick menu when tapping outside
document.addEventListener('touchstart', e => {
  if (!document.getElementById('QM').contains(e.target) && e.target !== fabEl) closeQM();
}, { passive: true });

// ── Overlay backdrop-tap to close ────────────────────────────────────────────
['txOv', 'trOv', 'accOv', 'rcOv', 'budOv', 'impOv'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

// ── Month navigation ─────────────────────────────────────────────────────────
document.getElementById('prevMonth').addEventListener('click', prevM, { passive: true });
document.getElementById('nextMonth').addEventListener('click', nextM, { passive: true });
document.getElementById('prevMonthB').addEventListener('click', () => { prevM(); renderBuds(); }, { passive: true });
document.getElementById('nextMonthB').addEventListener('click', () => { nextM(); renderBuds(); }, { passive: true });

// ── Resize: redraw chart ─────────────────────────────────────────────────────
window.addEventListener('resize', drawChart, { passive: true });

// ── Service Worker ────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.warn('SW registration failed:', err);
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
render();
setTimeout(checkDue, 900);
