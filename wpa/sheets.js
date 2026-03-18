'use strict';

// ── Sheet state ──────────────────────────────────────────────────────────────
let eTxId = null;
let eAccId = null;
let eRcId = null;
let eBudCat = null;
let eOverall = false;
let cType = 'expense';
let cRType = 'expense';
let sTEmo = EEMO[0];
let sAEmo = AEMO[0];
let sREmo = EEMO[0];

// ── Shared helpers ───────────────────────────────────────────────────────────

/** Populate a <select> with accounts; optionally pre-select one */
function fillSel(elId, selId) {
  const el = document.getElementById(elId);
  el.innerHTML = accs.map(a =>
    '<option value="' + a.id + '">' + a.emoji + ' ' + esc(a.name) + '</option>'
  ).join('');
  if (selId) el.value = selId;
}

/** Build an emoji picker grid */
function buildGrid(elId, emos, prefix) {
  const sel = prefix === 'acc' ? sAEmo : sREmo;
  document.getElementById(elId).innerHTML = emos.map(e =>
    '<button class="emoji-btn' + (e === sel ? ' selected' : '') + '" onclick="pickE(\'' + prefix + '\',\'' + e + '\')" type="button">' + e + '</button>'
  ).join('');
}

/** Select an emoji in a picker */
function pickE(prefix, e) {
  if (prefix === 'tx') { sTEmo = e; document.querySelectorAll('#txEmoGrid .emoji-btn').forEach(el => el.classList.toggle('selected', el.textContent === e)); }
  if (prefix === 'acc') { sAEmo = e; document.querySelectorAll('#accEmoGrid .emoji-btn').forEach(el => el.classList.toggle('selected', el.textContent === e)); }
  if (prefix === 'rc') { sREmo = e; document.querySelectorAll('#rcEmoGrid .emoji-btn').forEach(el => el.classList.toggle('selected', el.textContent === e)); }
}

// ── Transaction sheet ────────────────────────────────────────────────────────

function openAddTx(ft) {
  eTxId = null;
  document.getElementById('txTitle').textContent = 'New Entry';
  ['txAmt', 'txName', 'txNotes'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('txDelBtn').style.display = 'none';
  setType(ft || 'expense');
  fillSel('txAcc');
  document.getElementById('txOv').classList.add('open');
  setTimeout(() => document.getElementById('txAmt').focus(), 300);
}

function openEditTx(id) {
  const t = txs.find(x => x.id === id);
  if (!t) return;
  if (t.type === 'transfer_out' || t.type === 'transfer_in') { toast('Edit transfers via Accounts'); return; }
  eTxId = id;
  document.getElementById('txTitle').textContent = 'Edit Entry';
  document.getElementById('txAmt').value = t.amount;
  document.getElementById('txName').value = t.name;
  document.getElementById('txNotes').value = t.notes || '';
  document.getElementById('txDate').value = t.date;
  document.getElementById('txDelBtn').style.display = '';
  setType(t.type, t.category, t.emoji);
  fillSel('txAcc', t.account);
  document.getElementById('txOv').classList.add('open');
}

function closeTxOv() { document.getElementById('txOv').classList.remove('open'); }

function setType(type, precat, preemo) {
  cType = type;
  document.getElementById('expBtn').classList.toggle('active', type === 'expense');
  document.getElementById('incBtn').classList.toggle('active', type === 'income');
  const cats = type === 'expense' ? ECATS : ICATS;
  const cs = document.getElementById('txCat');
  cs.innerHTML = cats.map(c => '<option>' + c + '</option>').join('');
  if (precat && cats.includes(precat)) cs.value = precat;
  const emos = type === 'expense' ? EEMO : IEMO;
  sTEmo = preemo || emos[0];
  document.getElementById('txEmoGrid').innerHTML = emos.map(e =>
    '<button class="emoji-btn' + (e === sTEmo ? ' selected' : '') + '" onclick="pickE(\'tx\',\'' + e + '\')" type="button">' + e + '</button>'
  ).join('');
}

function saveTx() {
  const amount = parseFloat(document.getElementById('txAmt').value);
  const name = document.getElementById('txName').value.trim();
  const cat = document.getElementById('txCat').value;
  const date = document.getElementById('txDate').value;
  const account = document.getElementById('txAcc').value;
  const notes = document.getElementById('txNotes').value.trim();
  if (!amount || amount <= 0 || !name || !date) { alert('Fill in amount, description and date.'); return; }
  if (eTxId) {
    const i = txs.findIndex(t => t.id === eTxId);
    txs[i] = { ...txs[i], amount, name, category: cat, date, emoji: sTEmo, type: cType, account, notes };
  } else {
    txs.push({ id: uid(), amount, name, category: cat, date, emoji: sTEmo, type: cType, account, notes });
  }
  saveT(); closeTxOv(); render();
  if (navigator.vibrate) navigator.vibrate(35);
  toast(eTxId ? 'Updated' : 'Saved');
}

function delTx() {
  if (!eTxId || !confirm('Delete this entry?')) return;
  txs = txs.filter(t => t.id !== eTxId);
  saveT(); closeTxOv(); render(); toast('Deleted');
}

// ── Transfer sheet ───────────────────────────────────────────────────────────

function openTr() {
  fillSel('trFrom'); fillSel('trTo');
  if (accs.length >= 2) document.getElementById('trTo').selectedIndex = 1;
  document.getElementById('trAmt').value = '';
  document.getElementById('trDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('trNotes').value = '';
  document.getElementById('trOv').classList.add('open');
}

function closeTrOv() { document.getElementById('trOv').classList.remove('open'); }

function saveTr() {
  const fromId = document.getElementById('trFrom').value;
  const toId = document.getElementById('trTo').value;
  const amount = parseFloat(document.getElementById('trAmt').value);
  const date = document.getElementById('trDate').value;
  const notes = document.getElementById('trNotes').value.trim();
  if (!amount || amount <= 0) { alert('Enter valid amount.'); return; }
  if (fromId === toId) { alert('Choose different accounts.'); return; }
  const pair = uid();
  txs.push({ id: uid(), amount, name: 'Transfer → ' + aN(toId), category: 'Transfer', date, emoji: '🔄', type: 'transfer_out', account: fromId, notes, pair });
  txs.push({ id: uid(), amount, name: 'Transfer ← ' + aN(fromId), category: 'Transfer', date, emoji: '🔄', type: 'transfer_in', account: toId, notes, pair });
  saveT(); closeTrOv(); render(); renderAccs();
  if (navigator.vibrate) navigator.vibrate(35);
  toast('Transfer recorded');
}

// ── Account sheet ────────────────────────────────────────────────────────────

function openAddAcc() {
  eAccId = null;
  document.getElementById('accTitle').textContent = 'New Account';
  document.getElementById('accName').value = '';
  document.getElementById('accType').value = 'bank';
  document.getElementById('accCur').value = 'EUR';
  document.getElementById('accDelBtn').style.display = 'none';
  sAEmo = AEMO[0];
  buildGrid('accEmoGrid', AEMO, 'acc');
  document.getElementById('accOv').classList.add('open');
}

function openEditAcc(id) {
  const a = accs.find(x => x.id === id);
  if (!a) return;
  eAccId = id;
  document.getElementById('accTitle').textContent = 'Edit Account';
  document.getElementById('accName').value = a.name;
  document.getElementById('accType').value = a.type;
  document.getElementById('accCur').value = a.currency;
  document.getElementById('accDelBtn').style.display = '';
  sAEmo = a.emoji;
  buildGrid('accEmoGrid', AEMO, 'acc');
  document.getElementById('accOv').classList.add('open');
}

function closeAccOv() { document.getElementById('accOv').classList.remove('open'); }

function saveAcc() {
  const name = document.getElementById('accName').value.trim();
  const type = document.getElementById('accType').value;
  const currency = document.getElementById('accCur').value.trim() || 'EUR';
  if (!name) { alert('Enter account name.'); return; }
  if (eAccId) {
    const i = accs.findIndex(a => a.id === eAccId);
    accs[i] = { ...accs[i], name, type, currency, emoji: sAEmo };
  } else {
    accs.push({ id: uid(), name, type, currency, emoji: sAEmo });
  }
  saveA(); closeAccOv(); renderAccs(); toast('Account saved');
}

function delAcc() {
  if (!eAccId || !confirm('Delete account? Transactions remain.')) return;
  accs = accs.filter(a => a.id !== eAccId);
  saveA(); closeAccOv(); renderAccs();
}

// ── Recurring template sheet ─────────────────────────────────────────────────

function openAddRecur() {
  eRcId = null;
  document.getElementById('rcTitle').textContent = 'New Template';
  document.getElementById('rcName').value = '';
  document.getElementById('rcAmt').value = '';
  document.getElementById('rcDay').value = '1';
  document.getElementById('rcFreq').value = 'monthly';
  document.getElementById('rcDelBtn').style.display = 'none';
  setRType('expense');
  fillSel('rcAcc');
  document.getElementById('rcOv').classList.add('open');
}

function openEditRc(id) {
  const r = recs.find(x => x.id === id);
  if (!r) return;
  eRcId = id;
  document.getElementById('rcTitle').textContent = 'Edit Template';
  document.getElementById('rcName').value = r.name;
  document.getElementById('rcAmt').value = r.amount;
  document.getElementById('rcDay').value = r.day || 1;
  document.getElementById('rcFreq').value = r.freq;
  document.getElementById('rcDelBtn').style.display = '';
  setRType(r.type, r.category, r.emoji);
  fillSel('rcAcc', r.account);
  if (r.accountTo) document.getElementById('rcAccTo').value = r.accountTo;
  document.getElementById('rcOv').classList.add('open');
}

function closeRcOv() { document.getElementById('rcOv').classList.remove('open'); }

function setRType(type, precat, preemo) {
  cRType = type;
  document.getElementById('rExpBtn').classList.toggle('active', type === 'expense');
  document.getElementById('rIncBtn').classList.toggle('active', type === 'income');
  document.getElementById('rTrBtn').classList.toggle('active', type === 'transfer');
  const isT = type === 'transfer';
  document.getElementById('rcToWrap').style.display = isT ? '' : 'none';
  document.getElementById('rcCatWrap').style.display = isT ? 'none' : '';
  document.getElementById('rcAccLbl').textContent = isT ? 'From Account' : 'Account';
  if (isT) {
    fillSel('rcAccTo');
  } else {
    const cats = type === 'expense' ? ECATS : ICATS;
    const cs = document.getElementById('rcCat');
    cs.innerHTML = cats.map(c => '<option>' + c + '</option>').join('');
    if (precat && cats.includes(precat)) cs.value = precat;
  }
  const emos = type === 'income' ? IEMO : EEMO;
  sREmo = preemo || emos[0];
  buildGrid('rcEmoGrid', emos, 'rc');
}

function saveRc() {
  const name = document.getElementById('rcName').value.trim();
  const amount = parseFloat(document.getElementById('rcAmt').value);
  const freq = document.getElementById('rcFreq').value;
  const day = parseInt(document.getElementById('rcDay').value) || 1;
  const account = document.getElementById('rcAcc').value;
  const accountTo = cRType === 'transfer' ? document.getElementById('rcAccTo').value : null;
  const cat = cRType === 'transfer' ? 'Transfer' : document.getElementById('rcCat').value;
  if (!name || !amount || amount <= 0) { alert('Fill in name and amount.'); return; }
  if (cRType === 'transfer' && account === accountTo) { alert('Choose different accounts.'); return; }
  if (eRcId) {
    const i = recs.findIndex(r => r.id === eRcId);
    recs[i] = { ...recs[i], name, amount, category: cat, freq, day, emoji: sREmo, type: cRType, account, accountTo };
  } else {
    recs.push({ id: uid(), name, amount, category: cat, freq, day, emoji: sREmo, type: cRType, account, accountTo });
  }
  saveR(); closeRcOv(); renderRecs(); toast('Saved');
}

function delRc() {
  if (!eRcId || !confirm('Delete template?')) return;
  recs = recs.filter(r => r.id !== eRcId);
  saveR(); closeRcOv(); renderRecs();
}

/** Post a recurring template immediately as today's date */
function postNow(id) {
  const r = recs.find(x => x.id === id);
  if (!r) return;
  const n = new Date();
  const ds = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(Math.min(r.day || 1, 28)).padStart(2, '0');
  if (r.type === 'transfer') {
    const pair = uid();
    txs.push({ id: uid(), amount: r.amount, name: 'Transfer → ' + aN(r.accountTo), category: 'Transfer', date: ds, emoji: '🔄', type: 'transfer_out', account: r.account, notes: '', recurId: r.id, pair });
    txs.push({ id: uid(), amount: r.amount, name: 'Transfer ← ' + aN(r.account), category: 'Transfer', date: ds, emoji: '🔄', type: 'transfer_in', account: r.accountTo, notes: '', recurId: r.id, pair });
  } else {
    txs.push({ id: uid(), amount: r.amount, name: r.name, category: r.category, date: ds, emoji: r.emoji, type: r.type, account: r.account, notes: '', recurId: r.id });
  }
  saveT(); render(); renderAccs(); toast(r.name + ' posted');
}

// ── Budget sheet ─────────────────────────────────────────────────────────────

function openAddBud(cat) {
  eOverall = (cat === '__overall__');
  eBudCat = eOverall ? null : cat || null;
  const cw = document.getElementById('budCatWrap');
  if (eOverall) {
    document.getElementById('budTitle').textContent = 'Overall Budget';
    cw.style.display = 'none';
    document.getElementById('budAmt').value = overall?.amount || '';
    document.getElementById('budDelBtn').style.display = overall ? '' : 'none';
  } else {
    document.getElementById('budTitle').textContent = eBudCat ? 'Edit Budget' : 'New Budget';
    cw.style.display = '';
    const cs = document.getElementById('budCat');
    cs.innerHTML = ECATS.map(c => '<option>' + c + '</option>').join('');
    if (eBudCat) {
      cs.value = eBudCat; cs.disabled = true;
      const b = buds.find(x => x.cat === eBudCat);
      document.getElementById('budAmt').value = b ? b.amount : '';
    } else {
      cs.disabled = false;
      document.getElementById('budAmt').value = '';
    }
    document.getElementById('budDelBtn').style.display = eBudCat ? '' : 'none';
  }
  document.getElementById('budOv').classList.add('open');
}

function closeBudOv() { document.getElementById('budOv').classList.remove('open'); }

function saveBud() {
  const amount = parseFloat(document.getElementById('budAmt').value);
  if (!amount || amount <= 0) { alert('Enter a valid amount.'); return; }
  if (eOverall) {
    overall = { amount }; saveO();
  } else {
    const cat = document.getElementById('budCat').value;
    const idx = buds.findIndex(b => b.cat === cat);
    if (idx >= 0) buds[idx].amount = amount;
    else buds.push({ cat, amount });
    saveB();
  }
  closeBudOv(); render(); renderBuds(); toast('Budget saved');
}

function delBud() {
  if (eOverall) { overall = null; saveO(); }
  else { buds = buds.filter(b => b.cat !== eBudCat); saveB(); }
  closeBudOv(); render(); renderBuds();
}

// ── CSV import sheet ─────────────────────────────────────────────────────────

function openImport() {
  document.getElementById('impResult').innerHTML = '';
  document.getElementById('impFile').value = '';
  document.getElementById('impOv').classList.add('open');
}

function closeImpOv() { document.getElementById('impOv').classList.remove('open'); }

function handleImp(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      document.getElementById('impResult').innerHTML = '<div style="color:var(--red);font-size:11px;padding:8px 0">No data rows found.</div>';
      return;
    }
    const hdrs = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const iD = hdrs.indexOf('date');
    const iN = hdrs.findIndex(h => h.includes('desc') || h === 'name' || h === 'description');
    const iC = hdrs.indexOf('category');
    const iT = hdrs.indexOf('type');
    const iM = hdrs.indexOf('amount');
    const iA = hdrs.findIndex(h => h.includes('account'));
    if (iD < 0 || iM < 0) {
      document.getElementById('impResult').innerHTML = '<div style="color:var(--red);font-size:11px;padding:8px 0">Missing Date or Amount column.</div>';
      return;
    }
    let imp = 0, skip = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].match(/(".*?"|[^,]+)/g) || [];
      const g = idx => idx >= 0 ? (cols[idx] || '').replace(/"/g, '').trim() : '';
      const date = g(iD);
      const rawAmt = parseFloat(g(iM));
      if (!date || isNaN(rawAmt)) { skip++; continue; }
      const type = g(iT).toLowerCase() || 'expense';
      const amount = Math.abs(rawAmt);
      const name = g(iN) || 'Import';
      const category = g(iC) || 'Other';
      const accName = g(iA);
      let account = accs[0]?.id || '';
      if (accName) { const m = accs.find(a => a.name.toLowerCase() === accName.toLowerCase()); if (m) account = m.id; }
      txs.push({
        id: uid(), amount, name, category, date,
        emoji: type === 'income' ? '💵' : '🛒',
        type: ['income', 'expense', 'transfer_in', 'transfer_out'].includes(type) ? type : 'expense',
        account, notes: '',
      });
      imp++;
    }
    saveT(); render();
    document.getElementById('impResult').innerHTML =
      '<div style="color:var(--green);font-size:11px;padding:10px 0">✓ Imported ' + imp + ' entries' + (skip ? ' (' + skip + ' skipped)' : '') + '</div>';
    setTimeout(closeImpOv, 1800);
    toast('Imported ' + imp);
  };
  reader.readAsText(file);
}

// ── CSV export ───────────────────────────────────────────────────────────────

function exportCSV() {
  const rows = [['Date', 'Description', 'Category', 'Type', 'Amount', 'Account', 'Notes']];
  [...txs].sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
    const sign = t.type === 'income' || t.type === 'transfer_in' ? 1 : -1;
    rows.push([
      t.date,
      '"' + (t.name || '').replace(/"/g, '""') + '"',
      t.category || t.type,
      t.type,
      (sign * t.amount).toFixed(2),
      aN(t.account),
      '"' + (t.notes || '').replace(/"/g, '""') + '"',
    ]);
  });
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
  a.download = 'budget_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  toast('Exported');
}
