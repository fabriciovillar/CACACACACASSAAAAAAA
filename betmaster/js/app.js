/* ============================================
   BetMaster Pro - Utilidades globales
   ============================================ */

// --- LocalStorage helpers ---
const DB = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

// Claves de almacenamiento
const KEYS = {
  USERS: 'bm_users',
  SESSION: 'bm_session',     // email del usuario logueado
  BETS: 'bm_bets',           // todas las apuestas
  MOVEMENTS: 'bm_movements', // depósitos/retiros
  TICKET: 'bm_ticket'        // selección pendiente
};

// --- Sesión ---
function getSession() {
  const email = DB.get(KEYS.SESSION, null);
  if (!email) return null;
  const users = DB.get(KEYS.USERS, []);
  return users.find(u => u.email === email) || null;
}

function requireAuth() {
  if (!getSession()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem(KEYS.SESSION);
  localStorage.removeItem(KEYS.TICKET);
  window.location.href = '../index.html';
}

function updateUser(updated) {
  const users = DB.get(KEYS.USERS, []);
  const idx = users.findIndex(u => u.email === updated.email);
  if (idx >= 0) {
    users[idx] = updated;
    DB.set(KEYS.USERS, users);
  }
}

// --- Formatos ---
function fmtMoney(n) {
  return '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

// --- Toasts ---
function toast(message, type = 'success') {
  let wrap = document.querySelector('.bm-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'bm-toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'bm-toast ' + (type === 'error' ? 'error' : type === 'warn' ? 'warn' : '');
  const icon = type === 'error' ? 'fa-circle-xmark' : type === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-check';
  t.innerHTML = `<i class="fas ${icon} me-2"></i>${message}`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2800);
  setTimeout(() => t.remove(), 3200);
}

// --- Loader ---
function hideLoader() {
  const l = document.querySelector('.bm-loader');
  if (l) { l.classList.add('hide'); setTimeout(() => l.remove(), 600); }
}
window.addEventListener('load', () => setTimeout(hideLoader, 350));

// --- Navbar del dashboard (HTML reutilizable) ---
function renderNavbar(active = '') {
  const user = getSession();
  if (!user) return '';
  return `
  <nav class="bm-navbar">
    <div class="container-fluid px-3 py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
      <a class="bm-brand d-flex align-items-center gap-2" href="dashboard.html">
        <i class="fas fa-trophy text-green"></i> Bet<span class="accent">Master</span> Pro
      </a>
      <div class="d-flex flex-wrap align-items-center gap-2">
        <span class="bm-balance"><i class="fas fa-wallet me-1"></i> ${fmtMoney(user.balance)}</span>
        <button class="btn btn-bm btn-sm" data-bs-toggle="modal" data-bs-target="#depositModal"><i class="fas fa-plus me-1"></i> Depositar</button>
        <button class="btn btn-outline-bm btn-sm" data-bs-toggle="modal" data-bs-target="#withdrawModal"><i class="fas fa-arrow-up-from-bracket me-1"></i> Retirar</button>
        <a class="btn btn-outline-bm btn-sm ${active==='hist'?'text-green':''}" href="historial.html"><i class="fas fa-clock-rotate-left me-1"></i> Historial</a>
        <a class="btn btn-outline-bm btn-sm ${active==='perfil'?'text-green':''}" href="perfil.html"><i class="fas fa-user me-1"></i> Perfil</a>
        <button class="btn btn-ghost btn-sm" onclick="logout()"><i class="fas fa-right-from-bracket"></i></button>
      </div>
    </div>
  </nav>`;
}

// --- Modales de depósito y retiro (HTML reutilizable) ---
function renderFundsModals() {
  return `
  <!-- Modal Depósito -->
  <div class="modal fade" id="depositModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-credit-card text-green me-2"></i>Depositar fondos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form id="depositForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Número de tarjeta</label>
              <input type="text" class="form-control" id="depCard" maxlength="19" placeholder="1234 5678 9012 3456" required>
            </div>
            <div class="row g-2">
              <div class="col-7"><label class="form-label">Fecha</label><input type="text" class="form-control" id="depDate" placeholder="MM/AA" required></div>
              <div class="col-5"><label class="form-label">CVV</label><input type="text" class="form-control" id="depCvv" maxlength="3" placeholder="123" required></div>
            </div>
            <div class="mt-3">
              <label class="form-label">Monto a depositar</label>
              <input type="number" min="1" step="0.01" class="form-control" id="depAmount" placeholder="0.00" required>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-bm" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-bm"><i class="fas fa-check me-1"></i>Depositar</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Retiro -->
  <div class="modal fade" id="withdrawModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-arrow-up-from-bracket text-green me-2"></i>Retirar fondos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form id="withdrawForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Banco</label>
              <select class="form-select" id="wBank" required>
                <option value="">Selecciona un banco</option>
                <option>Banco Quispe</option>
                <option>BBVA</option>
                <option>Banco pampañaupa</option>
                <option>Banco Nación</option>
                <option>Interbak</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Número de cuenta</label>
              <input type="text" class="form-control" id="wAccount" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Monto a retirar</label>
              <input type="number" min="1" step="0.01" class="form-control" id="wAmount" required>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-bm" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-bm"><i class="fas fa-check me-1"></i>Retirar</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}