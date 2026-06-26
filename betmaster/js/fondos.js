/* ============================================
   BetMaster Pro - Depósitos y Retiros
   ============================================ */

function initFundsHandlers(onBalanceChange) {
  const dep = document.getElementById('depositForm');
  const wit = document.getElementById('withdrawForm');

  if (dep) {
    // Formatear tarjeta con espacios
    const card = document.getElementById('depCard');
    card.addEventListener('input', () => {
      let v = card.value.replace(/\D/g, '').slice(0, 16);
      card.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    const date = document.getElementById('depDate');
    date.addEventListener('input', () => {
      let v = date.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      date.value = v;
    });
    const cvv = document.getElementById('depCvv');
    cvv.addEventListener('input', () => { cvv.value = cvv.value.replace(/\D/g, '').slice(0, 3); });

    dep.addEventListener('submit', e => {
      e.preventDefault();
      const numCard = card.value.replace(/\s/g, '');
      const amount = parseFloat(document.getElementById('depAmount').value);
      if (numCard.length !== 16) return toast('La tarjeta debe tener 16 dígitos', 'error');
      if (cvv.value.length !== 3) return toast('CVV inválido', 'error');
      if (!amount || amount <= 0) return toast('Monto inválido', 'error');

      const user = getSession();
      user.balance = (user.balance || 0) + amount;
      updateUser(user);

      const movs = DB.get(KEYS.MOVEMENTS, []);
      movs.push({ tipo: 'Depósito', monto: amount, fecha: new Date().toISOString(), user: user.email });
      DB.set(KEYS.MOVEMENTS, movs);

      toast('Depósito realizado: ' + fmtMoney(amount));
      bootstrap.Modal.getInstance(document.getElementById('depositModal')).hide();
      dep.reset();
      onBalanceChange && onBalanceChange();
    });
  }

  if (wit) {
    wit.addEventListener('submit', e => {
      e.preventDefault();
      const bank = document.getElementById('wBank').value;
      const acc = document.getElementById('wAccount').value.trim();
      const amount = parseFloat(document.getElementById('wAmount').value);
      const user = getSession();
      if (!bank || !acc) return toast('Completa los datos bancarios', 'error');
      if (!amount || amount <= 0) return toast('Monto inválido', 'error');
      if (amount > (user.balance || 0)) return toast('Saldo insuficiente', 'error');

      user.balance -= amount;
      updateUser(user);
      const movs = DB.get(KEYS.MOVEMENTS, []);
      movs.push({ tipo: 'Retiro', monto: amount, fecha: new Date().toISOString(), banco: bank, cuenta: acc, user: user.email });
      DB.set(KEYS.MOVEMENTS, movs);

      toast('Retiro realizado: ' + fmtMoney(amount));
      bootstrap.Modal.getInstance(document.getElementById('withdrawModal')).hide();
      wit.reset();
      onBalanceChange && onBalanceChange();
    });
  }
}