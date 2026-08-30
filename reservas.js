/* ==========================================================================
   ReservaUO - CONTROLADOR DE RESERVAS (reservas.html)
   ========================================================================== */

// URL Base de tu API en Node.js (según tu server.js)
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión
  const sessionData = JSON.parse(localStorage.getItem('currentUser'));
  if (!sessionData) {
    window.location.href = 'index.html';
    return;
  }

  // CORRECCIÓN CRÍTICA: Extraer el usuario real si viene envuelto en el objeto de respuesta del servidor
  const currentUser = sessionData.usuario ? sessionData.usuario : sessionData;

  lucide.createIcons();
  initUserSession(currentUser);
  setupNavigation();
  setupNotifications();
  setupModals(currentUser);
  setupAdminPanel(currentUser);
  loadRealData(currentUser);
  setupDemoBanner();
  setupFineFormSubmit(); // Inicializa el detector del modal de multas
});

// --- SESIÓN DE USUARIO ---
function initUserSession(user) {
  document.getElementById('session-name').textContent = `${user.nombre} ${user.apellido || ''}`;
  document.getElementById('session-role').textContent = user.rol === 'administrador' ? 'Admin' : 'Residente';
  document.getElementById('welcome-user-name').textContent = user.nombre;

  // Mostrar panel admin si es administrador
  if (user.rol === 'administrador') {
    const adminNav = document.getElementById('nav-admin');
    if (adminNav) adminNav.classList.remove('hidden');
  }

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    showToast('Sesión Cerrada', 'Hasta pronto.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  });

  // Profile Modal
  document.getElementById('btn-edit-profile').addEventListener('click', () => {
    document.getElementById('profile-name').value = user.nombre || '';
    document.getElementById('profile-lastname').value = user.apellido || '';
    document.getElementById('profile-email').value = user.correo || '';
    document.getElementById('profile-modal').classList.remove('hidden');
  });

  // Profile Edit Submit
  document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const lastname = document.getElementById('profile-lastname').value;
    const email = document.getElementById('profile-email').value;

    try {
      const response = await fetch(`${API_URL}/auth/profile/${user.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, apellido: lastname, correo: email })
      });

      if (response.ok) {
        user.nombre = name;
        user.apellido = lastname;
        user.correo = email;
        
        const originalData = JSON.parse(localStorage.getItem('currentUser'));
        if (originalData && originalData.usuario) {
          originalData.usuario = user;
          localStorage.setItem('currentUser', JSON.stringify(originalData));
        } else {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }

        document.getElementById('session-name').textContent = `${name} ${lastname}`;
        document.getElementById('welcome-user-name').textContent = name;
        document.getElementById('profile-modal').classList.add('hidden');
        showToast('Perfil actualizado', 'Tus datos han sido guardados en MySQL.', 'success');
      } else {
        showToast('Error', 'No se pudo actualizar el perfil en el servidor.', 'danger');
      }
    } catch (error) {
      console.error(error);
      showToast('Error de conexión', 'No se pudo conectar con el servidor.', 'danger');
    }
  });
}

// --- NAVEGACIÓN POR TABS ---
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.app-tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(targetSection).classList.add('active');
    });
  });
}

// --- NOTIFICACIONES ---
function setupNotifications() {
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    notifDropdown.classList.add('hidden');
  });
}

// --- MODALS Y CREACIÓN DE RESERVAS ---
function setupModals(user) {
  const bookingModal = document.getElementById('booking-modal');
  const closeBooking = document.getElementById('btn-close-booking-modal');
  const cancelBooking = document.getElementById('btn-cancel-booking-modal');

  closeBooking.addEventListener('click', () => bookingModal.classList.add('hidden'));
  cancelBooking.addEventListener('click', () => bookingModal.classList.add('hidden'));
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) bookingModal.classList.add('hidden');
  });

  const profileModal = document.getElementById('profile-modal');
  const closeProfile = document.getElementById('btn-close-profile-modal');
  const cancelProfile = document.getElementById('btn-cancel-profile-modal');

  closeProfile.addEventListener('click', () => profileModal.classList.add('hidden'));
  cancelProfile.addEventListener('click', () => profileModal.classList.add('hidden'));
  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.classList.add('hidden');
  });

  // ENVIAR NUEVA RESERVA A MYSQL
  document.getElementById('booking-create-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!user.id_usuario) {
      showToast('Error de Sesión', 'ID de usuario inválido. Por favor vuelve a iniciar sesión.', 'danger');
      return;
    }

    const reservaData = {
      id_usuario: parseInt(user.id_usuario),
      id_espacio: parseInt(document.getElementById('booking-space-id').value),
      fecha: document.getElementById('booking-date').value,
      hora_inicio: document.getElementById('booking-start-time').value,
      hora_fin: document.getElementById('booking-end-time').value
    };

    try {
      const response = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      });

      const resultado = await response.json();

      if (response.ok) {
        showToast('¡Reserva Confirmada!', 'Registrada en MySQL exitosamente.', 'success');
        bookingModal.classList.add('hidden');
        loadRealData(user);
      } else {
        showToast('Atención', resultado.error || 'Error al guardar la reserva.', 'amber');
      }
    } catch (error) {
      console.error(error);
      showToast('Error de red', 'No se pudo conectar con el servidor para guardar.', 'danger');
    }
  });

  document.getElementById('booking-quick-slots').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val) {
      const [start, end] = val.split('-');
      document.getElementById('booking-start-time').value = start;
      document.getElementById('booking-end-time').value = end;
    }
  });
}

// --- ADMIN PANEL ---
function setupAdminPanel(user) {
  if (user.rol !== 'administrador') return;

  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminContents = document.querySelectorAll('.admin-tab-content');

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.adminTab;

      adminTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      adminContents.forEach(c => c.classList.remove('active'));
      
      const targetElement = document.getElementById(target);
      if (targetElement) {
        targetElement.classList.add('active');
      }

      if (target === 'admin-fine-spaces') {
        cargarMultasAdmin();
      }
    });
  });

  // Crear espacio en BD
  document.getElementById('space-manage-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const espacioData = {
      nombre: document.getElementById('space-name').value,
      descripcion: document.getElementById('space-desc').value,
      capacidad: document.getElementById('space-cap').value,
      imagen: document.getElementById('space-img').value
    };

    try {
      const response = await fetch(`${API_URL}/espacios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(espacioData)
      });

      if (response.ok) {
        showToast('Espacio Guardado', 'Registrado en MySQL con éxito.', 'success');
        e.target.reset();
        loadRealData(user);
        cargarEspaciosAdmin();
      } else {
        showToast('Error', 'No se pudo guardar el espacio.', 'danger');
      }
    } catch (error) {
      console.error(error);
      showToast('Error de red', 'No se pudo guardar el espacio.', 'danger');
    }
  });
}

// --- CARGA DINÁMICA DE DATOS DESDE TU SERVER.JS ---
async function loadRealData(user) {
  const spacesGrid = document.getElementById('spaces-grid-container');
  let mapeoImagenes = {
    quincho: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=75',
    sala_eventos: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75',
    gimnasio: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75',
    lavanderia: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=75'
  };

  try {
    // 1. OBTENER ESPACIOS
    const resEspacios = await fetch(`${API_URL}/espacios`);
    if (!resEspacios.ok) throw new Error("Fallo al traer espacios");
    const espacios = await resEspacios.json();

    if (espacios.length === 0) {
      spacesGrid.innerHTML = `<div class="timeline-empty">No hay áreas comunes en la BD.</div>`;
    } else {
      spacesGrid.innerHTML = espacios.map(space => {
        const imgUrl = mapeoImagenes[space.imagen] || space.imagen || mapeoImagenes.sala_eventos;
        return `
          <div class="space-card" data-space-id="${space.id_espacio}">
            <div class="space-card-media" style="background-image: url('${imgUrl}');">
              <div class="space-card-overlay"></div>
              <div class="space-card-title-group">
                <h4>${space.nombre}</h4>
              </div>
            </div>
            <div class="space-card-body">
              <p class="space-card-description">${space.descripcion}</p>
              <div class="space-card-meta">
                <div class="capacity-indicator">
                  <i data-lucide="users"></i>
                  <span>Capacidad: <strong>${space.capacidad}</strong></span>
                </div>
                <button class="btn-primary btn-xs" onclick="openBookingModal(${space.id_espacio}, '${space.nombre}', ${space.capacidad}, '${space.descripcion.replace(/'/g, "\\'")}')">
                  Reservar
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. OBTENER RESERVAS DEL USUARIO
    if (user.id_usuario) {
      const resReservas = await fetch(`${API_URL}/reservas?id_usuario=${user.id_usuario}`);
      const reservas = resReservas.ok ? await resReservas.json() : [];
      
      const activeList = document.getElementById('active-bookings-list');
      const historyList = document.getElementById('history-bookings-list');

      const hoyStr = new Date().toISOString().split('T')[0];
      const activas = reservas.filter(r => r.estado === 'confirmada' && r.fecha >= hoyStr);
      const pasadas = reservas.filter(r => r.estado === 'completada' || r.fecha < hoyStr || r.estado === 'cancelada');

      document.getElementById('dash-active-bookings-count').textContent = activas.length;
      document.getElementById('dash-next-booking-time').textContent = activas.length > 0 ? `${activas[0].fecha} ${activas[0].hora_inicio.slice(0,5)}` : 'Ninguna';

      if (activas.length === 0) {
        activeList.innerHTML = `<div class="timeline-empty">No tienes reservas activas pendientes.</div>`;
      } else {
        activeList.innerHTML = activas.map(r => `
          <div class="booking-card">
            <div class="booking-card-header">
              <span class="booking-card-title">${r.espacio_nombre || 'Espacio Común'}</span>
              <span class="booking-badge confirmada">${r.estado}</span>
            </div>
            <div class="booking-card-details">
              <div class="detail-item"><i data-lucide="calendar"></i><span>${r.fecha}</span></div>
              <div class="detail-item"><i data-lucide="clock"></i><span>${r.hora_inicio.slice(0,5)} - ${r.hora_fin.slice(0,5)}</span></div>
            </div>
            <div class="booking-card-actions">
              <button class="btn-danger btn-xs" onclick="cancelarReservaReal(${r.id_reserva}, this)">Cancelar</button>
            </div>
          </div>
        `).join('');
      }

      if (pasadas.length === 0) {
        historyList.innerHTML = `<div class="timeline-empty">Sin historial previo.</div>`;
      } else {
        historyList.innerHTML = pasadas.map(r => `
          <div class="booking-card">
            <div class="booking-card-header">
              <span class="booking-card-title">${r.espacio_nombre || 'Espacio Común'}</span>
              <span class="booking-badge completada">${r.estado}</span>
            </div>
            <div class="booking-card-details">
              <div class="detail-item"><i data-lucide="calendar"></i><span>${r.fecha}</span></div>
              <div class="detail-item"><i data-lucide="clock"></i><span>${r.hora_inicio.slice(0,5)} - ${r.hora_fin.slice(0,5)}</span></div>
            </div>
          </div>
        `).join('');
      }
    }

    // 3. ESTADÍSTICAS ADMIN Y LISTADO GENERAL DE RESERVAS
    if (user.rol === 'administrador') {
      cargarEspaciosAdmin();
      cargarMultasAdmin();
      
      const resAdmin = await fetch(`${API_URL}/admin/stats`);
      if (resAdmin.ok) {
        const bodyAdmin = await resAdmin.json();
        
        // Cargar cajas superiores
        document.getElementById('admin-stat-residents').textContent = bodyAdmin.stats.totalResidentes || '0';
        document.getElementById('admin-stat-bookings').textContent = bodyAdmin.stats.totalReservas || '0';
        document.getElementById('admin-stat-spaces').textContent = bodyAdmin.stats.activos || '0';
        
        // 🔥 NUEVO: Renderizar tabla de "Todas las Reservas" con botón para multar
        renderizarTodasLasReservasAdmin(bodyAdmin.todasLasReservas);
        
        // 🔥 NUEVO: Dibujar los gráficos SVG nativos dinámicos
        dibujarGraficoTorta(bodyAdmin.usoEspacios);
        dibujarGraficoBarras(bodyAdmin.usoEspacios);
      }
    }

  } catch (error) {
    console.warn("Error crítico conectando a la API de tu server.js. Cargando vista temporal:", error);
    cargarBackupDemoData(user);
  }

  // Buscador local
  document.getElementById('space-search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.space-card').forEach(card => {
      const name = card.querySelector('h4').textContent.toLowerCase();
      card.style.display = name.includes(query) ? '' : 'none';
    });
  });

  lucide.createIcons();
}

// --- RENDERIZAR TABLA DE RESERVAS DEL EDIFICIO CON ACCIÓN DE MULTA ---
// --- RENDERIZAR TABLA DE RESERVAS DEL EDIFICIO CON ACCIÓN DE MULTA ---
function renderizarTodasLasReservasAdmin(reservas) {
  const tablaBody = document.getElementById('admin-bookings-table-body');
  if (!tablaBody) return;

  if (!reservas || reservas.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="6" class="text-center text-slate-400 py-4">No hay reservas registradas en el edificio.</td></tr>`;
    return;
  }

  // Obtener la fecha de hoy en formato local YYYY-MM-DD
  const hoyStr = new Date().toISOString().split('T')[0];

  tablaBody.innerHTML = reservas.map(r => {
    // Limpiar la fecha proveniente de la BD (quitar zona horaria si viene con 'T')
    const fechaReserva = r.fecha.split('T')[0];
    
    // Determinar el estado visual
    let estadoVisual = r.estado;
    
    // Si el estado original es confirmada pero la fecha ya es menor a hoy, pasa a ser "completada"
    if (r.estado === 'confirmada' && fechaReserva < hoyStr) {
      estadoVisual = 'completada';
    }

    return `
      <tr>
        <td class="font-medium text-slate-200">${r.nombre} ${r.apellido || ''}</td>
        <td class="text-slate-300">${r.espacio_nombre}</td>
        <td class="text-slate-400 text-xs">${fechaReserva}</td>
        <td class="text-slate-400 text-xs">${r.hora_inicio.slice(0,5)} - ${r.hora_fin.slice(0,5)}</td>
        <td>
          <!-- Usamos el estadoVisual calculado para la clase CSS y el texto -->
          <span class="booking-badge ${estadoVisual}">${estadoVisual.toUpperCase()}</span>
        </td>
        <td>
          <button onclick="abrirModalMulta(${r.id_usuario}, ${r.id_reserva}, '${r.nombre} ${r.apellido || ''}')" class="btn-danger btn-xs" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
            ⚠️ Multar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
// --- LOGICA MODAL DE MULTAS ---
function abrirModalMulta(idUsuario, idReserva, nombreResidente) {
  // Creamos el modal dinámicamente si no existe en el HTML
  let fineModal = document.getElementById('fine-modal');
  if (!fineModal) {
    const modalHtml = `
      <div id="fine-modal" class="modal-backdrop hidden">
        <div class="modal-card modal-small" style="max-width: 400px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
            <h3 style="color:white; margin:0;">🚨 Aplicar Multa</h3>
            <button onclick="cerrarModalMulta()" style="background:none; border:none; color:#64748b; font-size:18px; cursor:pointer;">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 15px;">Sanción para: <strong id="fine-resident-name" style="color: #f1f5f9;"></strong></p>
            <form id="fine-create-form">
              <input type="hidden" id="fine-user-id">
              <input type="hidden" id="fine-booking-id">
              <div class="form-group" style="margin-bottom: 12px;">
                <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:4px;">Monto ($ CLP)</label>
                <input type="number" id="fine-amount" placeholder="Ej. 25000" required style="width:100%; padding:8px; background:#0f172a; border:1px solid #334155; color:white; border-radius:4px;">
              </div>
              <div class="form-group" style="margin-bottom: 15px;">
                <label style="color:#94a3b8; font-size:12px; display:block; margin-bottom:4px;">Motivo detallado</label>
                <textarea id="fine-reason" rows="3" placeholder="Ej. Daños estructurales en quincho..." required style="width:100%; padding:8px; background:#0f172a; border:1px solid #334155; color:white; border-radius:4px; resize:none;"></textarea>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" onclick="cerrarModalMulta()" style="padding:6px 12px; background:#334155; border:none; color:white; border-radius:4px; cursor:pointer;">Cancelar</button>
                <button type="submit" style="padding:6px 12px; background:#f59e0b; border:none; color:black; font-weight:600; border-radius:4px; cursor:pointer;">Registrar Sanción</button>
              </div>
            </form>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    fineModal = document.getElementById('fine-modal');
    setupFineFormSubmit();
  }

  document.getElementById('fine-user-id').value = idUsuario;
  document.getElementById('fine-booking-id').value = idReserva;
  document.getElementById('fine-resident-name').textContent = nombreResidente;
  document.getElementById('fine-create-form').reset();
  fineModal.classList.remove('hidden');
}

function cerrarModalMulta() {
  document.getElementById('fine-modal').classList.add('hidden');
}

function setupFineFormSubmit() {
  const form = document.getElementById('fine-create-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosMulta = {
      id_usuario: parseInt(document.getElementById('fine-user-id').value),
      id_reserva: document.getElementById('fine-booking-id').value ? parseInt(document.getElementById('fine-booking-id').value) : null,
      monto: parseInt(document.getElementById('fine-amount').value),
      motivo: document.getElementById('fine-reason').value
    };

    try {
      const response = await fetch(`${API_URL}/multas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosMulta)
      });

      if (response.ok) {
        showToast('🚨 Multa Registrada', 'Los datos se sincronizaron en MySQL.', 'success');
        cerrarModalMulta();
        cargarMultasAdmin();
      } else {
        showToast('Error', 'No se pudo procesar la multa.', 'danger');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red', 'Fallo al conectar con el servidor backend.', 'danger');
    }
  });
}

// --- RENDERIZADORES SVG NATIVOS PARA ESTADÍSTICAS ---
function dibujarGraficoTorta(usoEspacios) {
  const container = document.getElementById('chart-pie-container');
  if (!container) return;

  const totalReservas = usoEspacios.reduce((sum, item) => sum + item.reservasCount, 0);
  if (totalReservas === 0) {
    container.innerHTML = `<div style="text-align:center; color:#64748b; font-size:12px; padding:20px;">Sin datos de uso acumulados aún.</div>`;
    return;
  }

  // Generamos un gráfico circular limpio usando un SVG nativo
  let acumuladoPorcentaje = 0;
  const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  let elementosPath = '';
  let leyendas = '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:10px;">';

  usoEspacios.forEach((esp, idx) => {
    const pct = esp.reservasCount / totalReservas;
    const color = colores[idx % colores.length];
    
    // Cálculo de coordenadas para el arco del gráfico de torta
    const x1 = Math.sin(2 * Math.PI * acumuladoPorcentaje);
    const y1 = -Math.cos(2 * Math.PI * acumuladoPorcentaje);
    acumuladoPorcentaje += pct;
    const x2 = Math.sin(2 * Math.PI * acumuladoPorcentaje);
    const y2 = -Math.cos(2 * Math.PI * acumuladoPorcentaje);
    
    const largeArcFlag = pct > 0.5 ? 1 : 0;
    
    elementosPath += `<path d="M 0 0 L ${x1*80} ${y1*80} A 80 80 0 ${largeArcFlag} 1 ${x2*80} ${y2*80} Z" fill="${color}" stroke="#1e293b" stroke-width="2"/>`;
    leyendas += `<div style="font-size:11px; color:#94a3b8;"><span style="display:inline-block; width:10px; height:10px; background:${color}; border-radius:2px; margin-right:5px;"></span>${esp.nombre} (${Math.round(pct*100)}%)</div>`;
  });
  
  leyendas += '</div>';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
      <svg width="160" height="160" viewBox="-90 -90 180 180" style="transform: rotate(-90deg)">
        ${elementosPath}
      </svg>
      ${leyendas}
    </div>
  `;
}

function dibujarGraficoBarras(usoEspacios) {
  const container = document.getElementById('chart-bar-container');
  if (!container) return;

  const maxReservas = Math.max(...usoEspacios.map(e => e.reservasCount), 1);
  
  let barrasHtml = '<div style="display:flex; flex-direction:column; gap:12px; width:100%; padding:10px 0;">';
  
  usoEspacios.forEach(esp => {
    const anchoPct = (esp.reservasCount / maxReservas) * 100;
    barrasHtml += `
      <div style="width:100%;">
        <div style="display:flex; justify-content:between; font-size:11px; color:#cbd5e1; margin-bottom:4px;">
          <span>${esp.nombre}</span>
          <strong style="color:#10b981; margin-left:auto;">${esp.reservasCount} res.</strong>
        </div>
        <div style="width:100%; height:8px; background:#334155; border-radius:4px; overflow:hidden;">
          <div style="width:${anchoPct}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); border-radius:4px;"></div>
        </div>
      </div>
    `;
  });
  
  barrasHtml += '</div>';
  container.innerHTML = barrasHtml;
}

// CANCELAR RESERVA
async function cancelarReservaReal(idReserva, elementoBoton) {
  if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;
  try {
    const res = await fetch(`${API_URL}/reservas/${idReserva}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'cancelada' })
    });
    if (res.ok) {
      showToast('Reserva Cancelada', 'Se actualizó el estado en MySQL.', 'info');
      elementoBoton.closest('.booking-card').remove();
    } else {
      showToast('Error', 'No se pudo cancelar.', 'danger');
    }
  } catch (error) {
    console.error(error);
    showToast('Error de red', 'No se pudo procesar la cancelación.', 'danger');
  }
}

// --- BOOKING MODAL ---
function openBookingModal(spaceId, name, capacity, description) {
  document.getElementById('modal-space-name').textContent = name;
  document.getElementById('modal-space-capacity').textContent = capacity;
  document.getElementById('modal-space-description').textContent = description;
  document.getElementById('booking-space-id').value = spaceId;
  
  document.getElementById('booking-create-form').reset();
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('booking-date').min = today;
  document.getElementById('booking-date').value = today;
  
  document.getElementById('booking-modal').classList.remove('hidden');
  actualizarAgendaReservas(spaceId, today);
}

// --- COMPROBAR SI MUESTRA BANNER DEMO ---
async function setupDemoBanner() {
  const banner = document.getElementById('demo-banner');
  try {
    const check = await fetch(`${API_URL}/espacios`);
    if (check.ok) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  } catch (e) {
    banner.classList.remove('hidden');
  }
}

// --- RESPALDO VISUAL ---
function cargarBackupDemoData(user) {
  const spacesGrid = document.getElementById('spaces-grid-container');
  spacesGrid.innerHTML = `
    <div class="space-card" data-space-id="1">
      <div class="space-card-media" style="background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=75');">
        <div class="space-card-overlay"></div><div class="space-card-title-group"><h4>Error de Sincronización</h4></div>
      </div>
      <div class="space-card-body">
        <p class="space-card-description">Las rutas del frontend fallaron al hablar con server.js. Asegúrate de reiniciar tu terminal Node.</p>
        <div class="space-card-meta">
          <div class="capacity-indicator"><i data-lucide="users"></i><span>Capacidad: <strong>0</strong></span></div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// --- TOAST SYSTEM ---
function showToast(title, message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

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

// Agenda de Reservas
async function actualizarAgendaReservas(idEspacio, fechaSeleccionada) {
  const agendaContenedor = document.getElementById('modal-date-bookings-timeline');
  if (!agendaContenedor) return;

  if (!fechaSeleccionada) {
    agendaContenedor.innerHTML = `<div class="timeline-empty">Elige una fecha para ver las reservas registradas.</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/reservas`);
    if (!response.ok) throw new Error('Error al obtener las reservas');
    
    const todasLasReservas = await response.json();

    const reservasDelDia = todasLasReservas.filter(reserva => {
      const fechaReservaFormateada = reserva.fecha.split('T')[0]; 
      return reserva.id_espacio === parseInt(idEspacio) && 
             fechaReservaFormateada === fechaSeleccionada &&
             reserva.estado !== 'cancelada';
    });

    if (reservasDelDia.length === 0) {
      agendaContenedor.innerHTML = `
        <div class="text-center text-emerald-400 py-3 font-medium text-sm">
          🎉 ¡No hay reservas registradas para este día! Todo el horario está libre.
        </div>`;
      return;
    }

    agendaContenedor.innerHTML = `
      <div class="space-y-2 max-h-40 overflow-y-auto w-full">
        ${reservasDelDia.map(reserva => `
          <div class="flex justify-between items-center bg-slate-800/60 p-2 rounded border border-slate-700 my-1">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-amber-500" style="display:inline-block; width:8px; height:8px; background:#f59e0b; border-radius:50%;"></span>
              <span class="text-sm font-semibold text-slate-200" style="margin-left: 6px;">${reserva.hora_inicio.slice(0,5)} - ${reserva.hora_fin.slice(0,5)}</span>
            </div>
            <span class="text-xs text-slate-400">Ocupado</span>
          </div>
        `).join('')}
      </div>
    `;

  } catch (error) {
    console.error("Error cargando la agenda:", error);
    agendaContenedor.innerHTML = `<div class="text-center text-red-400 py-3 text-sm">⚠️ No se pudo cargar la agenda actual.</div>`;
  }
}

// Cargar Espacios Admin
async function cargarEspaciosAdmin() {
  const listaContenedor = document.getElementById('admin-spaces-list-container');
  if (!listaContenedor) return;

  try {
    const response = await fetch(`${API_URL}/espacios`); 
    if (!response.ok) throw new Error('Error al obtener los espacios comunes');
    
    const espacios = await response.json();

    if (espacios.length === 0) {
      listaContenedor.innerHTML = `
        <div class="text-center text-slate-500 py-6 text-sm">
          No hay espacios comunes registrados aún. Crea uno a la izquierda.
        </div>`;
      return;
    }

    listaContenedor.innerHTML = espacios.map(espacio => `
      <div class="bg-slate-900/60 p-4 rounded-lg border border-slate-800 mb-3 flex justify-between items-center">
        <div>
          <h4 class="text-sm font-semibold text-slate-200">${espacio.nombre}</h4>
          <p class="text-xs text-slate-400 mt-1">${espacio.descripcion || 'Sin descripción'}</p>
          <div class="flex space-x-3 mt-2 text-xs text-slate-400">
            <span>👥 Capacidad: <strong>${espacio.capacidad}</strong></span>
            <span class="capitalize">🖼️ Icono: <strong>${espacio.imagen || 'lavanderia'}</strong></span>
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error("Error cargando la lista de espacios en el panel admin:", error);
    listaContenedor.innerHTML = `<div class="text-center text-red-400 py-3 text-sm">⚠️ Error al conectar con los espacios.</div>`;
  }
}

// Cargar Multas Admin
async function cargarMultasAdmin() {
  const tablaBody = document.getElementById('admin-fines-table-body');
  if (!tablaBody) return;

  try {
    const response = await fetch(`${API_URL}/multas`);
    if (!response.ok) throw new Error('Error al obtener las multas');
    
    const multas = await response.json();

    if (multas.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="6" class="text-center text-slate-400 py-4">No hay multas registradas en el sistema.</td></tr>`;
      return;
    }

    tablaBody.innerHTML = multas.map(multa => `
      <tr>
        <td class="font-medium text-slate-200">Depto ${multa.numeroDepto || 'S/D'} - ${multa.nombre_residente || 'Usuario'}</td>
        <td class="text-slate-300 text-xs">${multa.motivo}</td>
        <td class="text-amber-400 font-semibold">$${parseInt(multa.monto).toLocaleString('es-CL')}</td>
        <td class="text-slate-400 text-xs">${multa.fecha_emision ? multa.fecha_emision.split('T')[0] : 'S/F'}</td>
        <td>
          <span class="booking-badge ${multa.estado === 'pagada' ? 'completada' : 'confirmada'}">
            ${multa.estado}
          </span>
        </td>
        <td>
          ${multa.estado === 'pendiente' ? `
            <button onclick="marcarMultaPagada(${multa.id_multa})" class="btn-primary btn-xs" style="background:#10b981; padding:2px 6px; border-radius:4px; font-size:11px;">
              ✓ Pagada
            </button>
          ` : '<span class="text-emerald-400 text-xs font-medium">✓ Al día</span>'}
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error("Error al cargar multas:", error);
    tablaBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-400 py-4">⚠️ Error al conectar con el registro de multas.</td></tr>`;
  }
}

// Marcar Multa Pagada
async function marcarMultaPagada(idMulta) {
  if (!confirm("¿Confirmas que el residente ha pagado esta multa?")) return;
  try {
    const res = await fetch(`${API_URL}/multas/${idMulta}/pagar`, { method: 'PUT' });
    if (res.ok) {
      showToast('Multa Actualizada', 'Se registró el pago en MySQL.', 'success');
      cargarMultasAdmin();
    }
  } catch (error) {
    console.error(error);
  }
}