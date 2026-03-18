'use strict';

// ── View state ───────────────────────────────────────────────────────────────
let vy = new Date().getFullYear();
let vm = new Date().getMonth();
let lFilter = 'all';
let dimKey = null;

// ── Main overview render ─────────────────────────────────────────────────────
function render() {
  const key = mkey(vy, vm);
  document.getElementById('monthLabel').textContent = MON[vm].slice(0, 3).toUpperCase() + ' ' + vy;
  document.getElementById('monthLabelB').textContent = MON[vm].slice(0, 3).toUpperCase() + ' ' + vy;

  // Income / expense totals for selected month
  const mt = txs.filter(t => t.date.startsWith(key) && t.type !== 'transfer_out' && t.type !== 'transfer_in');
  let inc = 0, exp = 0;
  mt.forEach(t => t.type === 'income' ? inc += t.amount : exp += t.amount);
  const bal = inc - exp;

  // Month-over-month delta
  let pvy = vy, pvm = vm - 1;
  if (pvm < 0) { pvm = 11; pvy--; }
  const pmt = txs.filter(t => t.date.startsWith(mkey(pvy, pvm)) && t.type !== 'transfer_out' && t.type !== 'transfer_in');
  let pi = 0, pe = 0;
  pmt.forEach(t => t.type === 'income' ? pi += t.amount : pe += t.amount);
  const mom = document.getElementById('momTxt');
  if (pmt.length) {
    const d = bal - (pi - pe);
    mom.textContent = (d >= 0 ? '↑ ' : '↓ ') + fmt(Math.abs(d)) + ' vs ' + MON[pvm].slice(0, 3).toUpperCase();
    mom.className = 'hero-meta ' + (d >= 0 ? 'up' : 'down');
  } else {
    mom.textContent = '';
  }

  // Hero balance
  const bEl = document.getElementById('balAmt');
  bEl.textContent = (bal < 0 ? '-' : '') + fmt(bal);
  bEl.className = 'hero-amount' + (bal < 0 ? ' neg' : '');

  document.getElementById('incAmt').textContent = fmt(inc);
  document.getElementById('expAmt').textContent = fmt(exp);

  // Overall budget strip
  const obs = document.getElementById('obStrip');
  if (overall && overall.amount > 0) {
    const p = Math.min(exp / overall.amount * 100, 100);
    const cls = exp >= overall.amount ? 'over' : exp >= overall.amount * .8 ? 'near' : '';
    const rem = overall.amount - exp;
    obs.innerHTML =
      '<div class="ob-strip" onclick="openAddBud(\'__overall__\')">' +
      '<div class="ob-top"><span class="ob-lbl">Monthly Budget</span>' +
      '<span class="ob-nums">' + fmt(exp) + ' / ' + fmt(overall.amount) +
      (rem >= 0 ? ' · ' + fmt(rem) + ' left' : ' · ' + fmt(-rem) + ' over') + '</span></div>' +
      '<div class="ob-track"><div class="ob-fill ' + cls + '" style="width:' + p.toFixed(1) + '%"></div></div>' +
      '</div>';
  } else {
    obs.innerHTML = '';
  }

  // Category breakdown
  const cm = {};
  mt.filter(t => t.type === 'expense').forEach(t => { cm[t.category] = (cm[t.category] || 0) + t.amount; });
  const ce = Object.entries(cm).sort((a, b) => b[1] - a[1]);
  const cs = document.getElementById('catSection');
  if (ce.length) {
    const mx = ce[0][1] || 1;
    cs.innerHTML = '<div class="sec">By Category</div><div class="card">' +
      ce.map(([c, a]) => {
        const b = buds.find(x => x.cat === c);
        let fp, fc = '';
        if (b) { fp = Math.min(a / b.amount * 100, 100).toFixed(1); fc = a >= b.amount ? 'over' : a >= b.amount * .8 ? 'near' : ''; }
        else { fp = (a / mx * 100).toFixed(1); }
        return '<div class="cat-row">' +
          '<span class="cat-name">' + esc(c) + '</span>' +
          '<div class="cat-track"><div class="cat-fill ' + fc + '" style="width:' + fp + '%"></div></div>' +
          '<span class="cat-right">' + (b ? fmt(a) + '/' + fmt(b.amount) : fmt(a)) + '</span>' +
          '</div>';
      }).join('') +
      '</div>';
  } else {
    cs.innerHTML = '';
  }

  // Recent transactions — date desc, then id desc as tiebreaker for same-day entries
  const recent = mt.slice().sort((a, b) => {
    const dc = b.date.localeCompare(a.date);
    return dc !== 0 ? dc : b.id.localeCompare(a.id);
  }).slice(0, 6);
  document.getElementById('recentList').innerHTML = recent.length
    ? recent.map(txHTML).join('')
    : '<div class="empty">No entries this month</div>';

  drawChart();

  // Keep budgets page in sync if open
  if (document.getElementById('page-budgets').classList.contains('active')) renderBuds();
}

// ── Transaction row HTML ─────────────────────────────────────────────────────
function txHTML(t) {
  const isIn = t.type === 'income' || t.type === 'transfer_in';
  const sign = isIn ? '+' : '-';
  const cls = isIn ? 'pos' : 'neu';
  const sub = t.type === 'transfer_out' ? 'Transfer out'
    : t.type === 'transfer_in' ? 'Transfer in'
      : (t.category || '') + ' · ' + fdate(t.date);
  return '<div class="row" onclick="openEditTx(\'' + t.id + '\')" data-id="' + t.id + '">' +
    '<div class="row-icon">' + t.emoji + '</div>' +
    '<div class="row-body">' +
    '<div class="row-title">' + esc(t.name) + '</div>' +
    '<div class="row-sub">' + esc(sub) + '</div>' +
    '</div>' +
    '<div class="row-right">' +
    '<div class="row-value ' + cls + '">' + sign + fmt(t.amount) + '</div>' +
    '<div style="font-size:9px;color:var(--muted);margin-top:2px">' + aE(t.account) + ' ' + esc(aN(t.account)) + '</div>' +
    '</div>' +
    '<div class="swipe-bg">🗑 Delete</div>' +
    '</div>';
}

// ── 6-month trend chart ──────────────────────────────────────────────────────
function drawChart() {
  const cv = document.getElementById('tChart');
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.parentElement.offsetWidth - 32, H = 80;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  // Build 6 months
  const ms = [];
  for (let i = 5; i >= 0; i--) {
    let my = vy, mm = vm - i;
    if (mm < 0) { mm += 12; my--; }
    ms.push({ key: mkey(my, mm), lbl: MON[mm].slice(0, 3) });
  }

  // Net value per month (income - expenses)
  const nd = ms.map(({ key }) => {
    const mt = txs.filter(t => t.date.startsWith(key) && t.type !== 'transfer_out' && t.type !== 'transfer_in');
    let inc = 0, exp = 0;
    mt.forEach(t => t.type === 'income' ? inc += t.amount : exp += t.amount);
    return inc - exp;
  });

  const pl = 10, pr = 10, pt = 8, pb = 20;
  const cw = W - pl - pr, ch = H - pt - pb, n = nd.length;

  // Scale: symmetric around zero
  const maxAbs = Math.max(...nd.map(Math.abs), 1) * 1.2;
  const xO = i => pl + (i / (n - 1)) * cw;
  const yO = v => pt + ch / 2 - (v / maxAbs) * (ch / 2);  // zero = middle

  // Zero line
  ctx.beginPath();
  ctx.moveTo(pl, pt + ch / 2);
  ctx.lineTo(pl + cw, pt + ch / 2);
  ctx.strokeStyle = 'rgba(255,255,255,.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Fill area above/below zero — clip to positive (green) and negative (red)
  // Green fill (profit zones)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, pt, W, ch / 2);  // top half only
  ctx.clip();
  ctx.beginPath();
  ctx.moveTo(xO(0), yO(nd[0]));
  for (let i = 1; i < n; i++) ctx.lineTo(xO(i), yO(nd[i]));
  ctx.lineTo(xO(n - 1), pt + ch / 2);
  ctx.lineTo(xO(0), pt + ch / 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,200,150,.08)';
  ctx.fill();
  ctx.restore();

  // Red fill (loss zones)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, pt + ch / 2, W, ch / 2 + 1);  // bottom half only
  ctx.clip();
  ctx.beginPath();
  ctx.moveTo(xO(0), yO(nd[0]));
  for (let i = 1; i < n; i++) ctx.lineTo(xO(i), yO(nd[i]));
  ctx.lineTo(xO(n - 1), pt + ch / 2);
  ctx.lineTo(xO(0), pt + ch / 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,68,68,.08)';
  ctx.fill();
  ctx.restore();

  // Draw line segments — green above zero, red below, split at crossings
  for (let i = 0; i < n - 1; i++) {
    const x1 = xO(i), y1 = yO(nd[i]);
    const x2 = xO(i + 1), y2 = yO(nd[i + 1]);
    const zero = pt + ch / 2;
    const v1 = nd[i], v2 = nd[i + 1];

    if ((v1 >= 0) === (v2 >= 0)) {
      // Same side — single color segment
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = v1 >= 0 ? 'rgba(0,200,150,.8)' : 'rgba(255,68,68,.8)';
      ctx.lineWidth = 1.5; ctx.stroke();
    } else {
      // Crosses zero — split at crossing point
      const t = v1 / (v1 - v2);
      const xm = x1 + t * (x2 - x1);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xm, zero);
      ctx.strokeStyle = v1 >= 0 ? 'rgba(0,200,150,.8)' : 'rgba(255,68,68,.8)';
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xm, zero); ctx.lineTo(x2, y2);
      ctx.strokeStyle = v2 >= 0 ? 'rgba(0,200,150,.8)' : 'rgba(255,68,68,.8)';
      ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  // Dots + month labels
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.arc(xO(i), yO(nd[i]), 2.5, 0, Math.PI * 2);
    ctx.fillStyle = nd[i] >= 0 ? 'rgba(0,200,150,.9)' : 'rgba(255,68,68,.9)';
    ctx.fill();
    ctx.fillStyle = 'rgba(64,64,64,.9)';
    ctx.font = '8px DM Mono,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ms[i].lbl, xO(i), H - 3);
  }
}

// ── Ledger ───────────────────────────────────────────────────────────────────
function setF(f, el) {
  lFilter = f;
  document.querySelectorAll('.fchip').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderLedger();
}

function renderLedger() {
  const q = (document.getElementById('txSearch').value || '').toLowerCase().trim();
  let s = [...txs].sort((a, b) => b.date.localeCompare(a.date));
  if (lFilter === 'transfer') s = s.filter(t => t.type === 'transfer_out' || t.type === 'transfer_in');
  else if (lFilter !== 'all') s = s.filter(t => t.type === lFilter);
  if (q) s = s.filter(t =>
    (t.name || '').toLowerCase().includes(q) ||
    (t.category || '').toLowerCase().includes(q) ||
    (t.notes || '').toLowerCase().includes(q)
  );
  document.getElementById('ledgerList').innerHTML = s.length
    ? s.map(txHTML).join('')
    : '<div class="empty">No entries found</div>';
  attachSwipe();
}

// ── Swipe-to-delete ──────────────────────────────────────────────────────────
function attachSwipe() {
  document.querySelectorAll('.row[data-id]').forEach(row => {
    if (row._sw) return;
    row._sw = true;
    let sx = null, dx = 0;
    row.addEventListener('touchstart', e => { sx = e.touches[0].clientX; dx = 0; }, { passive: true });
    row.addEventListener('touchmove', e => {
      if (sx === null) return;
      dx = e.touches[0].clientX - sx;
      if (dx < -10) {
        row.style.transform = 'translateX(' + Math.max(dx, -80) + 'px)';
        row.classList.toggle('reveal', dx < -40);
      }
    }, { passive: true });
    row.addEventListener('touchend', () => {
      if (dx < -60) {
        const id = row.dataset.id;
        row.style.transition = 'transform .18s,opacity .18s';
        row.style.transform = 'translateX(-110%)';
        row.style.opacity = '0';
        setTimeout(() => {
          txs = txs.filter(t => t.id !== id);
          saveT(); render();
          if (document.getElementById('page-transactions').classList.contains('active')) renderLedger();
          toast('Deleted');
        }, 185);
      } else {
        row.style.transition = 'transform .18s';
        row.style.transform = '';
        row.classList.remove('reveal');
        setTimeout(() => { row.style.transition = ''; }, 200);
      }
      sx = null;
    }, { passive: true });
  });
}

// ── Accounts ─────────────────────────────────────────────────────────────────
function renderAccs() {
  const bm = calcBals();
  const total = Object.values(bm).reduce((s, v) => s + v, 0);
  const nw = document.getElementById('nwVal');
  nw.textContent = (total < 0 ? '-' : '') + fmt(total);
  nw.className = 'nw-val ' + (total >= 0 ? 'pos' : 'neg');

  document.getElementById('accList').innerHTML = accs.length
    ? accs.map(a => {
      const b = bm[a.id] || 0;
      return '<div class="row" onclick="openEditAcc(\'' + a.id + '\')">' +
        '<div class="row-icon">' + a.emoji + '</div>' +
        '<div class="row-body">' +
        '<div class="row-title">' + esc(a.name) + '</div>' +
        '<div class="row-sub">' + a.type.toUpperCase() + ' · ' + esc(a.currency) + '</div>' +
        '</div>' +
        '<div class="row-value ' + (b >= 0 ? 'pos' : 'neg') + '">' + (b >= 0 ? '+' : '') + fmt(b) + '</div>' +
        '</div>';
    }).join('')
    : '<div class="empty">No accounts</div>';
}

// ── Recurring templates ──────────────────────────────────────────────────────
function renderRecs() {
  document.getElementById('recurList').innerHTML = recs.length
    ? recs.map(r =>
      '<div class="row" onclick="openEditRc(\'' + r.id + '\')">' +
      '<div class="row-icon">' + r.emoji + '</div>' +
      '<div class="row-body">' +
      '<div class="row-title">' + esc(r.name) + '</div>' +
      '<div class="row-sub">' + r.freq.toUpperCase() + ' · Day ' + r.day + ' · ' + esc(r.category) + '</div>' +
      '</div>' +
      '<div class="row-right">' +
      '<div class="row-value ' + (r.type === 'income' ? 'pos' : 'neu') + '">' +
      (r.type === 'income' ? '+' : '-') + fmt(r.amount) +
      '</div>' +
      '<button onclick="event.stopPropagation();postNow(\'' + r.id + '\')" ' +
      'style="margin-top:5px;font-size:9px;letter-spacing:.08em;background:none;border:1px solid var(--border);color:var(--muted);padding:3px 8px;font-family:var(--f);cursor:pointer;white-space:nowrap">' +
      'Post now' +
      '</button>' +
      '</div>' +
      '</div>'
    ).join('')
    : '<div class="empty">No recurring templates</div>';
}

// ── Budgets ──────────────────────────────────────────────────────────────────
function renderBuds() {
  const key = mkey(vy, vm);
  const mt = txs.filter(t => t.date.startsWith(key) && t.type === 'expense');
  const sm = {};
  mt.forEach(t => { sm[t.category] = (sm[t.category] || 0) + t.amount; });
  const totalExp = Object.values(sm).reduce((a, b) => a + b, 0);

  // Overall budget card
  const obc = document.getElementById('obCard');
  if (overall && overall.amount > 0) {
    const p = Math.min(totalExp / overall.amount * 100, 100);
    const cls = totalExp >= overall.amount ? 'over' : totalExp >= overall.amount * .8 ? 'near' : '';
    const rem = overall.amount - totalExp;
    obc.innerHTML =
      '<div class="sec">Overall Budget</div>' +
      '<div class="card">' +
      '<div class="bud-row" onclick="openAddBud(\'__overall__\')">' +
      '<div class="bud-top"><span class="bud-name">Monthly Total</span><span class="bud-nums">' + fmt(totalExp) + ' / ' + fmt(overall.amount) + '</span></div>' +
      '<div class="bud-track"><div class="bud-fill ' + cls + '" style="width:' + p.toFixed(1) + '%"></div></div>' +
      '<div class="bud-remain" style="color:' + (rem >= 0 ? 'var(--muted)' : 'var(--red)') + '">' +
      (rem >= 0 ? fmt(rem) + ' remaining' : fmt(-rem) + ' over budget') +
      '</div>' +
      '</div>' +
      '</div>';
  } else {
    obc.innerHTML =
      '<div class="sec">Overall Budget</div>' +
      '<div class="card">' +
      '<div class="row" onclick="openAddBud(\'__overall__\')">' +
      '<div class="row-body"><div class="row-title" style="color:var(--muted)">Tap to set overall monthly limit…</div></div>' +
      '<div style="color:var(--muted);font-size:16px;padding-right:2px">›</div>' +
      '</div>' +
      '</div>';
  }

  // Category budgets
  if (!buds.length) {
    document.getElementById('budList').innerHTML = '<div class="empty">No category budgets yet</div>';
    return;
  }
  document.getElementById('budList').innerHTML = buds.map(b => {
    const spent = sm[b.cat] || 0;
    const p = Math.min(spent / b.amount * 100, 100);
    const cls = spent >= b.amount ? 'over' : spent >= b.amount * .8 ? 'near' : '';
    const rem = b.amount - spent;
    return '<div class="bud-row" onclick="openAddBud(\'' + b.cat + '\')">' +
      '<div class="bud-top"><span class="bud-name">' + esc(b.cat) + '</span><span class="bud-nums">' + fmt(spent) + ' / ' + fmt(b.amount) + '</span></div>' +
      '<div class="bud-track"><div class="bud-fill ' + cls + '" style="width:' + p.toFixed(1) + '%"></div></div>' +
      '<div class="bud-remain" style="color:' + (rem >= 0 ? 'var(--muted)' : 'var(--red)') + '">' +
      (rem >= 0 ? fmt(rem) + ' remaining' : fmt(-rem) + ' over budget') +
      '</div>' +
      '</div>';
  }).join('');
}

// ── Due-recurring banner ─────────────────────────────────────────────────────
function checkDue() {
  const n = new Date(), k = mkey(n.getFullYear(), n.getMonth());
  if (localStorage.getItem('bgt_dismissed') === k) return;
  const due = getDue();
  if (!due.length) return;
  dimKey = k;
  document.getElementById('dueList').innerHTML = due.map(r =>
    '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">' +
    '<span>' + r.emoji + '</span>' +
    '<span style="flex:1;font-size:11px;color:var(--text2)">' + esc(r.name) + '</span>' +
    '<span style="font-size:11px;color:' + (r.type === 'income' ? 'var(--green)' : 'var(--text2)') + '">' +
    (r.type === 'income' ? '+' : '-') + fmt(r.amount) +
    '</span>' +
    '</div>'
  ).join('');
  document.getElementById('dueBanner').style.display = '';
}

function applyDue() {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth();
  getDue().forEach(r => {
    const d = String(Math.min(r.day || 1, 28)).padStart(2, '0');
    const ds = y + '-' + String(m + 1).padStart(2, '0') + '-' + d;
    if (r.type === 'transfer') {
      const pair = uid();
      txs.push({ id: uid(), amount: r.amount, name: 'Transfer → ' + aN(r.accountTo), category: 'Transfer', date: ds, emoji: '🔄', type: 'transfer_out', account: r.account, notes: '', recurId: r.id, pair });
      txs.push({ id: uid(), amount: r.amount, name: 'Transfer ← ' + aN(r.account), category: 'Transfer', date: ds, emoji: '🔄', type: 'transfer_in', account: r.accountTo, notes: '', recurId: r.id, pair });
    } else {
      txs.push({ id: uid(), amount: r.amount, name: r.name, category: r.category, date: ds, emoji: r.emoji, type: r.type, account: r.account, notes: '', recurId: r.id });
    }
  });
  saveT(); dismissDue(); render(); toast('Recurring applied');
}

function dismissDue() {
  localStorage.setItem('bgt_dismissed', dimKey);
  document.getElementById('dueBanner').style.display = 'none';
}

// ── Month navigation ─────────────────────────────────────────────────────────
function prevM() { vm--; if (vm < 0) { vm = 11; vy--; } render(); }
function nextM() { vm++; if (vm > 11) { vm = 0; vy++; } render(); }
