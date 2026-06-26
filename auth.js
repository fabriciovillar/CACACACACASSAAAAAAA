/* ============================================
   BetMaster Pro - Registro y Login
   ============================================ */

// REGISTRO
function handleRegister(e) {
  e.preventDefault();
  const f = e.target;
  const nombre = f.nombre.value.trim();
  const apellido = f.apellido.value.trim();
  const dni = f.dni.value.trim();
  const email = f.email.value.trim().toLowerCase();
  const nacimiento = f.nacimiento.value;
  const pass = f.password.value;
  const pass2 = f.password2.value;

  // Validaciones
  if (!nombre || !apellido || !dni || !email || !nacimiento || !pass || !pass2) {
    return toast('Completa todos los campos', 'error');
  }
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!reEmail.test(email)) return toast('Correo inválido', 'error');

  // Mayor de 18
  const birth = new Date(nacimiento);
  const ageMs = Date.now() - birth.getTime();
  const age = new Date(ageMs).getUTCFullYear() - 1970;
  if (age < 18) return toast('Debes ser mayor de 18 años', 'error');

  if (pass.length < 8) return toast('La contraseña debe tener mínimo 8 caracteres', 'error');
  if (pass !== pass2) return toast('Las contraseñas no coinciden', 'error');

  const users = DB.get(KEYS.USERS, []);
  if (users.find(u => u.email === email)) return toast('El correo ya está registrado', 'error');

  const user = {
    nombre, apellido, dni, email, nacimiento,
    password: pass, // demo (no producción)
    balance: 0,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  DB.set(KEYS.USERS, users);

  toast('Cuenta creada con éxito. Inicia sesión.');
  setTimeout(() => window.location.href = 'login.html', 1200);
}

// LOGIN
function handleLogin(e) {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value.trim().toLowerCase();
  const pass = f.password.value;
  const users = DB.get(KEYS.USERS, []);
  const user = users.find(u => u.email === email);
  if (!user) return toast('Usuario no encontrado', 'error');
  if (user.password !== pass) return toast('Contraseña incorrecta', 'error');
  DB.set(KEYS.SESSION, user.email);
  toast('Bienvenido ' + user.nombre);
  setTimeout(() => window.location.href = 'dashboard.html', 700);
}