/* ==========================================================================
   ReservaUO - CONTROLADOR DE AUTENTICACIÓN (index.html)
   ========================================================================== */

/* ==========================================================================
   ReservaUO - CONTROLADOR DE AUTENTICACIÓN (index.html / app.js)
   ========================================================================== */

const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initFormTabs();
  initPasswordToggle();
  setupAuthForms();
  initHeroSlider();
});

// --- CAMBIO DE PESTAÑAS (LOGIN / REGISTRO / RECUPERAR) ---
function initFormTabs() {
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const recoverForm = document.getElementById('recover-form');
  const gotoRecover = document.getElementById('goto-recover');
  const backToLogin = document.getElementById('back-to-login');

  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    recoverForm.classList.remove('active');
  });

  tabRegisterBtn.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    recoverForm.classList.remove('active');
  });

  gotoRecover.addEventListener('click', () => {
    loginForm.classList.remove('active');
    recoverForm.classList.add('active');
  });

  backToLogin.addEventListener('click', () => {
    recoverForm.classList.remove('active');
    loginForm.classList.add('active');
  });
}

// --- MOSTRAR / OCULTAR CONTRASEÑA ---
function initPasswordToggle() {
  const togglePw = document.getElementById('toggle-pw');
  const passwordInput = document.getElementById('login-password');
  const pwIcon = document.getElementById('pw-icon');

  if (togglePw && passwordInput) {
    togglePw.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      pwIcon.setAttribute('data-lucide', isPassword ? 'eye' : 'eye-off');
      lucide.createIcons();
    });
  }
}

// --- PROCESAMIENTO DE FORMULARIOS CON MYSQL ---
function setupAuthForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const recoverForm = document.getElementById('recover-form');

  // 1. LOGIN DE USUARIOS
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('login-email').value;
    const contrasena = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar la sesión exactamente como la estructura de tu server.js (data.usuario)
        localStorage.setItem('currentUser', JSON.stringify(data));
        showToast('¡Bienvenido!', 'Inicio de sesión exitoso.', 'success');
        
        setTimeout(() => {
          window.location.href = 'reservas.html';
        }, 1000);
      } else {
        showToast('Error de Ingreso', data.error || 'Credenciales inválidas.', 'danger');
      }
    } catch (error) {
      console.error(error);
      showToast('Error de conexión', 'No se pudo conectar con el servidor backend.', 'danger');
    }
  });

  // 2. REGISTRO DE USUARIOS NUEVOS (Guarda directamente en MySQL)
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('reg-nombre').value;
    const apellido = document.getElementById('reg-apellido').value;
    const correo = document.getElementById('reg-email').value;
    const contrasena = document.getElementById('reg-password').value;
    const rol = document.getElementById('reg-rol').value;
    const numeroDepto = document.getElementById('reg-numero').value || "101";

    // Enviamos "A" por defecto para evitar que falle la validación estricta de torreDepto en tu server.js
    const registroData = {
      nombre,
      apellido,
      correo,
      contrasena,
      rol,
      numeroDepto,
      torreDepto: "A" 
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registroData)
      });

      const data = await response.json();

      if (response.ok) {
        showToast('¡Registro Exitoso!', 'Usuario guardado en MySQL. Ya puedes iniciar sesión.', 'success');
        registerForm.reset();
        // Redirigir automáticamente a la pestaña de login
        document.getElementById('tab-login-btn').click();
      } else {
        showToast('No se pudo registrar', data.error || 'Verifica los datos.', 'amber');
      }
    } catch (error) {
      console.error(error);
      showToast('Error de Red', 'Fallo al enviar los datos a MySQL.', 'danger');
    }
  });

  // 3. RECUPERAR / ACTUALIZAR CONTRASEÑA
  recoverForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('recover-email').value;
    const nuevaContrasena = document.getElementById('recover-new-password').value;

    try {
      const response = await fetch(`${API_URL}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, nuevaContrasena })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Contraseña Restablecida', data.message, 'success');
        recoverForm.reset();
        document.getElementById('back-to-login').click();
      } else {
        showToast('Atención', data.error || 'No se pudo actualizar.', 'amber');
      }
    } catch (error) {
      console.error(error);
      showToast('Error', 'No hay respuesta del servidor.', 'danger');
    }
  });
}

// --- ANIMACIÓN OPCIONAL DEL CARRUSEL VISUAL ---
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0;

  if (slides.length === 0) return;

  function changeSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      changeSlide(parseInt(dot.dataset.slide));
    });
  });

  setInterval(() => {
    let next = (currentSlide + 1) % slides.length;
    changeSlide(next);
  }, 5000);
}

// --- SISTEMA DE TOASTS NOTIFICACIONES ---
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      <span>${message}</span>
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => { toast.remove(); }, 300);
  }, 3500);
}