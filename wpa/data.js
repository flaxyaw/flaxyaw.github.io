'use strict';

// ── Category / emoji constants ─────────────────────────────────────────────
const ECATS = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Utilities', 'Subscriptions', 'Other'];
const ICATS = ['Salary', 'Freelance', 'Gift', 'Investment', 'Crypto', 'Other'];

const EEMO = ['🍕', '🍔', '☕', '🛒', '🚌', '🚗', '⛽', '🏠', '💊', '💆', '🎬', '🎮', '👗', '👟', '📱', '💡', '🔧', '📦', '🐶', '✈️', '🏋️', '📚', '🍺', '🎵', '🎁', '💸', '🏥', '🧴', '🍜', '🥤'];
const IEMO = ['💼', '💵', '🤝', '📈', '🎁', '🏦', '💻', '🎓', '🏆', '⭐', '🌟', '✨'];
const AEMO = ['🏦', '💳', '💵', '🪙', '💰', '🏧', '📊', '💎', '🔑', '🌐', '🏠', '📱', '💼', '📉', '🏪'];

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ── Persistent state ────────────────────────────────────────────────────────
let txs = JSON.parse(localStorage.getItem('bgt_txs') || '[]');
let accs = JSON.parse(localStorage.getItem('bgt_accs') || '[]');
let recs = JSON.parse(localStorage.getItem('bgt_recurs') || '[]');
let buds = JSON.parse(localStorage.getItem('bgt_budgets') || '[]');
let overall = JSON.parse(localStorage.getItem('bgt_overall') || 'null');

// Seed default accounts on first run
if (!accs.length) {
  accs = [
    { id: 'acc_cash', name: 'Cash', type: 'cash', currency: 'EUR', emoji: '💵' },
    { id: 'acc_bank', name: 'Bank', type: 'bank', currency: 'EUR', emoji: '🏦' },
  ];
  saveA();
}

// ── Save helpers ────────────────────────────────────────────────────────────
function saveT() { localStorage.setItem('bgt_txs', JSON.stringify(txs)); }
function saveA() { localStorage.setItem('bgt_accs', JSON.stringify(accs)); }
function saveR() { localStorage.setItem('bgt_recurs', JSON.stringify(recs)); }
function saveB() { localStorage.setItem('bgt_budgets', JSON.stringify(buds)); }
function saveO() { localStorage.setItem('bgt_overall', JSON.stringify(overall)); }

// ── General utilities ───────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function fmt(n) { return '€' + Math.abs(+n).toFixed(2); }
function mkey(y, m) { return y + '-' + String(m + 1).padStart(2, '0'); }
function fdate(d) {
  const p = d.split('-');
  return parseInt(p[2]) + ' ' + MON[parseInt(p[1]) - 1].slice(0, 3).toUpperCase() + ' ' + p[0];
}
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Account lookups ─────────────────────────────────────────────────────────
function aBy(id) { return accs.find(a => a.id === id); }
function aN(id) { const a = aBy(id); return a ? a.name : '—'; }
function aE(id) { const a = aBy(id); return a ? a.emoji : '💳'; }

// ── Toast ───────────────────────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Balance calculator ──────────────────────────────────────────────────────
function calcBals() {
  const m = {};
  accs.forEach(a => { m[a.id] = 0; });
  txs.forEach(t => {
    if (!t.account || m[t.account] === undefined) return;
    if (t.type === 'income') m[t.account] += t.amount;
    else if (t.type === 'expense') m[t.account] -= t.amount;
    else if (t.type === 'transfer_out') m[t.account] -= t.amount;
    else if (t.type === 'transfer_in') m[t.account] += t.amount;
  });
  return m;
}

// ── Recurring: which templates haven't been posted this period ──────────────
function getDue() {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth(), key = mkey(y, m);
  return recs.filter(r => {
    if (r.freq === 'monthly') return !txs.some(t => t.recurId === r.id && t.date.startsWith(key));
    if (r.freq === 'yearly') return !txs.some(t => t.recurId === r.id && t.date.startsWith(y + '-'));
    return false;
  });
}
