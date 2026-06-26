/* ============================================
   BetMaster Pro - Núcleo de Apuestas
   ============================================ */

// Partidos de fútbol simulados
const MATCHES = [
  { id: 'm1', league: 'LaLiga',         home: 'Real Madrid',  away: 'Barcelona',    date: '2026-07-02', time: '21:00', odds: { home: 2.10, draw: 3.30, away: 2.95 } },
  { id: 'm2', league: 'Premier League', home: 'Manchester City', away: 'Liverpool', date: '2026-07-03', time: '17:30', odds: { home: 1.85, draw: 3.60, away: 4.10 } },
  { id: 'm3', league: 'Serie A',        home: 'Inter',        away: 'Juventus',     date: '2026-07-03', time: '20:45', odds: { home: 2.40, draw: 3.10, away: 2.80 } },
  { id: 'm4', league: 'Bundesliga',     home: 'Bayern Munich',away: 'Dortmund',     date: '2026-07-04', time: '15:30', odds: { home: 1.65, draw: 4.00, away: 4.80 } },
  { id: 'm5', league: 'Ligue 1',        home: 'PSG',          away: 'Marseille',    date: '2026-07-04', time: '21:00', odds: { home: 1.55, draw: 4.20, away: 5.50 } },
  { id: 'm6', league: 'Copa Libertadores', home: 'Boca Juniors', away: 'River Plate', date: '2026-07-05', time: '20:00', odds: { home: 2.65, draw: 3.05, away: 2.55 } },
  { id: 'm7', league: 'Premier League', home: 'Arsenal',      away: 'Chelsea',      date: '2026-07-05', time: '16:00', odds: { home: 2.05, draw: 3.40, away: 3.50 } },
  { id: 'm8', league: 'LaLiga',         home: 'Atlético Madrid', away: 'Sevilla',   date: '2026-07-06', time: '19:30', odds: { home: 1.75, draw: 3.50, away: 4.50 } }
];

function renderMatches() {
  return MATCHES.map(m => `
    <div class="match-card" data-match="${m.id}">
      <div class="d-flex justify-content-between align-items-center">
        <span class="match-league"><i class="fas fa-futbol me-1"></i>${m.league}</span>
        <span class="match-time"><i class="far fa-clock me-1"></i>${m.date} · ${m.time}</span>
      </div>
      <div class="match-teams">
        <div class="match-team home">${m.home}</div>
        <div class="match-vs">VS</div>
        <div class="match-team away">${m.away}</div>
      </div>
      <div class="odds-row">
        <button class="odd-btn" data-pick="home"><small>Local</small><strong>${m.odds.home.toFixed(2)}</strong></button>
        <button class="odd-btn" data-pick="draw"><small>Empate</small><strong>${m.odds.draw.toFixed(2)}</strong></button>
        <button class="odd-btn" data-pick="away"><small>Visitante</small><strong>${m.odds.away.toFixed(2)}</strong></button>
      </div>
    </div>`).join('');
}

function getMatch(id) { return MATCHES.find(m => m.id === id); }
function pickLabel(m, pick) { return pick === 'home' ? m.home : pick === 'away' ? m.away : 'Empate'; }

// --- Ticket ---
function getTicket() { return DB.get(KEYS.TICKET, null); }
function setTicket(t) { t ? DB.set(KEYS.TICKET, t) : localStorage.removeItem(KEYS.TICKET); renderTicket(); }

function selectOdd(matchId, pick) {
  const m = getMatch(matchId);
  const odd = m.odds[pick];
  setTicket({ matchId, pick, odd, amount: 0 });
  highlightSelection();
}

function highlightSelection() {
  document.querySelectorAll('.odd-btn').forEach(b => b.classList.remove('selected'));
  const t = getTicket(); if (!t) return;
  const card = document.querySelector(`.match-card[data-match="${t.matchId}"]`);
  if (card) card.querySelector(`.odd-btn[data-pick="${t.pick}"]`)?.classList.add('selected');
}

function renderTicket() {
  const el = document.getElementById('ticket');
  if (!el) return;
  const user = getSession();
  const t = getTicket();
  if (!t) {
    el.innerHTML = `
      <h5 class="mb-3"><i class="fas fa-receipt text-green me-2"></i>Ticket</h5>
      <div class="ticket-empty">
        <i class="fas fa-hand-pointer fa-2x mb-2 d-block"></i>
        Selecciona una cuota para empezar a apostar.
      </div>`;
    return;
  }
  const m = getMatch(t.matchId);
  const amount = parseFloat(t.amount) || 0;
  const profit = amount * t.odd;
  el.innerHTML = `
    <h5 class="mb-3"><i class="fas fa-receipt text-green me-2"></i>Ticket</h5>
    <div class="ticket-selection">
      <div class="sel-match">${m.home} vs ${m.away}</div>
      <div class="sel-pick">${pickLabel(m, t.pick)} <span class="text-yellow ms-2">@ ${t.odd.toFixed(2)}</span></div>
    </div>
    <div class="mb-2">
      <label class="form-label">Monto</label>
      <input type="number" min="1" step="0.01" class="form-control" id="ticketAmount" value="${amount || ''}" placeholder="0.00">
    </div>
    <div class="ticket-row"><span>Cuota</span><strong>${t.odd.toFixed(2)}</strong></div>
    <div class="ticket-row profit"><span>Ganancia potencial</span><strong>${fmtMoney(profit)}</strong></div>
    <div class="ticket-row"><span>Saldo disponible</span><strong>${fmtMoney(user.balance)}</strong></div>
    <div class="d-grid gap-2 mt-3">
      <button class="btn btn-bm" id="confirmBet"><i class="fas fa-check me-1"></i>Confirmar apuesta</button>
      <button class="btn btn-ghost btn-sm" id="clearTicket">Quitar selección</button>
    </div>
  `;
  document.getElementById('ticketAmount').addEventListener('input', e => {
    const v = parseFloat(e.target.value) || 0;
    const tk = getTicket(); tk.amount = v;
    DB.set(KEYS.TICKET, tk);
    const p = v * tk.odd;
    el.querySelector('.profit strong').textContent = fmtMoney(p);
  });
  document.getElementById('clearTicket').addEventListener('click', () => { setTicket(null); highlightSelection(); });
  document.getElementById('confirmBet').addEventListener('click', confirmBet);
}

function confirmBet() {
  const user = getSession();
  const t = getTicket();
  const amount = parseFloat(t.amount) || 0;
  if (amount <= 0) return toast('Ingresa un monto válido', 'error');
  if (amount > (user.balance || 0)) return toast('Saldo insuficiente', 'error');

  user.balance -= amount;
  updateUser(user);

  const m = getMatch(t.matchId);
  const bet = {
    id: 'b' + Date.now(),
    fecha: new Date().toISOString(),
    partido: `${m.home} vs ${m.away}`,
    seleccion: pickLabel(m, t.pick),
    monto: amount,
    cuota: t.odd,
    estado: 'Pendiente',
    ganancia: 0,
    user: user.email
  };
  const bets = DB.get(KEYS.BETS, []);
  bets.unshift(bet);
  DB.set(KEYS.BETS, bets);

  setTicket(null);
  highlightSelection();
  toast('Apuesta confirmada: ' + fmtMoney(amount));
  // refrescar saldo en navbar
  document.dispatchEvent(new Event('bm:balance'));
}

function bindMatchClicks() {
  document.querySelectorAll('.match-card').forEach(card => {
    const id = card.dataset.match;
    card.querySelectorAll('.odd-btn').forEach(btn => {
      btn.addEventListener('click', () => selectOdd(id, btn.dataset.pick));
    });
  });
}

// --- Liquidación (resolver apuesta) ---
function settleBet(id, result) {
  const bets = DB.get(KEYS.BETS, []);
  const b = bets.find(x => x.id === id);
  if (!b || b.estado !== 'Pendiente') return;
  const user = getSession();
  if (result === 'win') {
    b.estado = 'Ganadora';
    b.ganancia = b.monto * b.cuota;
    user.balance += b.ganancia;
    updateUser(user);
    toast('¡Apuesta ganadora! +' + fmtMoney(b.ganancia));
  } else {
    b.estado = 'Perdida';
    b.ganancia = 0;
    toast('Apuesta perdida', 'warn');
  }
  DB.set(KEYS.BETS, bets);
  document.dispatchEvent(new Event('bm:balance'));
  if (typeof renderHistory === 'function') renderHistory();
}