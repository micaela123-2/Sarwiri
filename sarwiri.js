/* ==========================================================================
   SARWIRI — JavaScript Principal
   Lógica: búsqueda, filtros, modal de tours, carrusel, WhatsApp, animaciones
   ========================================================================== */

/* ===== DATOS DE TOURS (Demo) ===== */
const TOURS_DATA = [
  {
    id: 1,
    nombre: "Sandboard en Cerro Dragón",
    categoria: "aventura",
    duracion: "3 horas",
    duracionHoras: 3,
    precio: 25000,
    personas_min: 1,
    personas_max: 10,
    descripcion: "Deslízate por las imponentes dunas de Cerro Dragón con equipamiento profesional y guía experto. Una experiencia única que combina adrenalina con los paisajes desérticos de Iquique.",
    incluye: ["Equipamiento completo", "Instructor certificado", "Traslado al cerro", "Hidratación"],
    imagen: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
    popular: true,
    destino: "Iquique",
    dificultad: "Media",
    idiomas: ["Español", "Inglés"]
  },
  {
    id: 2,
    nombre: "Tour Humberstone",
    categoria: "cultura",
    duracion: "5 horas",
    duracionHoras: 5,
    precio: 30000,
    personas_min: 1,
    personas_max: 20,
    descripcion: "Explora la Oficina Salitrera Humberstone, Patrimonio de la Humanidad UNESCO. Un viaje en el tiempo a la era del oro blanco, con guías especializados en historia del salitre.",
    incluye: ["Guía especializado", "Entrada al museo", "Transporte desde Iquique", "Material histórico"],
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    popular: true,
    destino: "Pampa del Tamarugal",
    dificultad: "Baja",
    idiomas: ["Español", "Inglés", "Portugués"]
  },
  {
    id: 3,
    nombre: "Parapente en Iquique",
    categoria: "aventura",
    duracion: "2 horas",
    duracionHoras: 2,
    precio: 75000,
    personas_min: 1,
    personas_max: 4,
    descripcion: "Vuela sobre el Pacífico y las dunas en tándem con pilotos certificados. La vista desde el aire de Iquique es absolutamente espectacular. ¡La experiencia más emocionante de Tarapacá!",
    incluye: ["Vuelo tándem 20-30 min", "Piloto certificado", "Seguro de vuelo", "Fotos y video", "Certificado"],
    imagen: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80",
    popular: true,
    destino: "Iquique",
    dificultad: "Media",
    idiomas: ["Español", "Inglés"]
  },
  {
    id: 4,
    nombre: "Buceo en Playa Brava",
    categoria: "naturaleza",
    duracion: "4 horas",
    duracionHoras: 4,
    precio: 60000,
    personas_min: 1,
    personas_max: 6,
    descripcion: "Descubre el mundo submarino del Pacífico con fauna marina única. Perfecta para principiantes con bautismo de buceo o para certificados con exploración de hasta 18 metros.",
    incluye: ["Equipo de buceo completo", "Instructor PADI", "Bautismo o inmersión", "Fotografía submarina"],
    imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    popular: true,
    destino: "Iquique",
    dificultad: "Media",
    idiomas: ["Español", "Inglés"]
  },
  {
    id: 5,
    nombre: "Tour Astronómico en el Desierto",
    categoria: "experiencia",
    duracion: "3 horas",
    duracionHoras: 3,
    precio: 40000,
    personas_min: 2,
    personas_max: 15,
    descripcion: "Observa el cielo más limpio del mundo desde el desierto de Atacama. Telescopios profesionales y astrónomos expertos para una noche mágica bajo millones de estrellas.",
    incluye: ["Telescopios profesionales", "Astrónomo guía", "Mate y snacks", "Transporte nocturno"],
    imagen: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80",
    popular: true,
    destino: "Desierto de Atacama",
    dificultad: "Baja",
    idiomas: ["Español", "Inglés"]
  },
  {
    id: 6,
    nombre: "City Tour Iquique",
    categoria: "cultura",
    duracion: "2 horas",
    duracionHoras: 2,
    precio: 20000,
    personas_min: 1,
    personas_max: 25,
    descripcion: "Recorre los puntos históricos de Iquique: la Plaza Prat, el Casino Español, el teatro histórico y el barrio inglés. Perfecto para conocer la ciudad desde sus raíces.",
    incluye: ["Guía histórico", "Transporte panorámico", "Visita a miradores", "Mapa de la ciudad"],
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    popular: true,
    destino: "Iquique",
    dificultad: "Baja",
    idiomas: ["Español", "Inglés", "Francés"]
  },
  {
    id: 7,
    nombre: "Salar Grande y Geoglifos",
    categoria: "naturaleza",
    duracion: "8 horas",
    duracionHoras: 8,
    precio: 55000,
    personas_min: 2,
    personas_max: 12,
    descripcion: "Visita el Salar Grande y los impresionantes geoglifos del Desierto de Tarapacá. Una jornada completa explorando las maravillas geológicas y arqueológicas de la región.",
    incluye: ["Transporte 4x4", "Guía especializado", "Almuerzo típico", "Seguro de excursión"],
    imagen: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
    popular: false,
    destino: "Desierto de Tarapacá",
    dificultad: "Media",
    idiomas: ["Español"]
  },
  {
    id: 8,
    nombre: "Géiser del Tatio al Amanecer",
    categoria: "aventura",
    duracion: "6 horas",
    duracionHoras: 6,
    precio: 65000,
    personas_min: 2,
    personas_max: 8,
    descripcion: "Parte de madrugada para presenciar el espectáculo del géiser del Tatio al amanecer, uno de los campos geotérmicos más altos del mundo a 4.320 m de altitud.",
    incluye: ["Transporte 4x4", "Guía experto en altitud", "Desayuno altiplánico", "Equipo de abrigo"],
    imagen: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    popular: false,
    destino: "Altiplano",
    dificultad: "Alta",
    idiomas: ["Español", "Inglés"]
  }
];

/* ===== DESTINOS DATA ===== */
const DESTINOS_DATA = [
  {
    nombre: "Iquique Centro",
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80",
    tours: 4,
    descripcion: "Ciudad costera con historia salitrera y modernidad"
  },
  {
    nombre: "Pampa del Tamarugal",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
    tours: 2,
    descripcion: "Bosque de tamarugos en pleno desierto"
  },
  {
    nombre: "Desierto de Atacama",
    imagen: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=80",
    tours: 3,
    descripcion: "El desierto más árido del mundo, cielos únicos"
  },
  {
    nombre: "Altiplano",
    imagen: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80",
    tours: 2,
    descripcion: "Lagos, volcanes y fauna andina a más de 4.000m"
  },
  {
    nombre: "Cerro Dragón",
    imagen: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=80",
    tours: 1,
    descripcion: "Las dunas más altas junto al mar"
  },
  {
    nombre: "Playa Brava",
    imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80",
    tours: 2,
    descripcion: "Aguas cristalinas con vida marina extraordinaria"
  }
];

/* ===== UTILIDADES ===== */
function formatCLP(num) {
  return '$' + num.toLocaleString('es-CL');
}

function getCatClass(cat) {
  const map = { aventura: 'cat-aventura', cultura: 'cat-cultura', naturaleza: 'cat-naturaleza', experiencia: 'cat-experiencia' };
  return map[cat] || 'cat-aventura';
}

function getCatLabel(cat) {
  const map = { aventura: 'Aventura', cultura: 'Cultura', naturaleza: 'Naturaleza', experiencia: 'Experiencia' };
  return map[cat] || cat;
}

function getDifColor(dif) {
  return { 'Baja': '#10b981', 'Media': '#f59e0b', 'Alta': '#ef4444' }[dif] || '#6b7280';
}

/* ===== FUNCIONES DE RENDERIZADO ===== */
function renderTourCard(tour, showPopular = false) {
  return `
    <div class="col-md-6 col-lg-4 mb-4 fade-up">
      <div class="tour-card h-100">
        <div class="tour-card-img">
          <img src="${tour.imagen}" alt="${tour.nombre}" loading="lazy">
          <span class="tour-category-badge ${getCatClass(tour.categoria)}">${getCatLabel(tour.categoria)}</span>
          ${showPopular && tour.popular ? `
            <span class="tour-popular-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Popular
            </span>` : ''}
        </div>
        <div class="tour-card-body">
          <h3 class="tour-card-title">${tour.nombre}</h3>
          <div class="tour-card-meta">
            <span class="tour-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${tour.duracion}
            </span>
            <span class="tour-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Hasta ${tour.personas_max} pers.
            </span>
          </div>
          <div class="tour-card-footer">
            <div class="tour-price">
              <span class="price-desde">Desde</span>
              <span class="price-amount">${formatCLP(tour.precio)} <span>/ persona</span></span>
            </div>
            <button class="btn-ver-detalle" onclick="openTourModal(${tour.id})" id="btn-tour-${tour.id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ===== MODAL DE TOUR ===== */
function openTourModal(id) {
  const tour = TOURS_DATA.find(t => t.id === id);
  if (!tour) return;

  const modal = document.getElementById('tourModal');
  if (!modal) return;

  modal.querySelector('#modal-img').src = tour.imagen;
  modal.querySelector('#modal-img').alt = tour.nombre;
  modal.querySelector('#modal-cat').textContent = getCatLabel(tour.categoria);
  modal.querySelector('#modal-cat').className = `tour-category-badge ${getCatClass(tour.categoria)} me-2`;
  modal.querySelector('#modal-title').textContent = tour.nombre;
  modal.querySelector('#modal-duracion').textContent = tour.duracion;
  modal.querySelector('#modal-personas').textContent = `1 a ${tour.personas_max} personas`;
  modal.querySelector('#modal-destino').textContent = tour.destino;
  modal.querySelector('#modal-dificultad').textContent = tour.dificultad;
  modal.querySelector('#modal-dificultad').style.color = getDifColor(tour.dificultad);
  modal.querySelector('#modal-desc').textContent = tour.descripcion;
  modal.querySelector('#modal-price').innerHTML = `${formatCLP(tour.precio)} <small>/ persona</small>`;

  const incluye = modal.querySelector('#modal-incluye');
  incluye.innerHTML = tour.incluye.map(item => `
    <li class="d-flex align-items-center gap-2 mb-2 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${item}</span>
    </li>
  `).join('');

  const reservaUrl = `reservas.html?tour=${tour.id}`;
  modal.querySelector('#btn-modal-reservar').href = reservaUrl;

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

/* ===== HERO SLIDER ===== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide-img');
  const dots = document.querySelectorAll('.hero-dot-btn');
  if (!slides.length) return;

  let current = 0;

  function setSlide(index) {
    slides[current].classList.remove('active');
    if (dots.length) dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    if (dots.length) dots[current].classList.add('active');
  }

  if (dots.length) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => setSlide(parseInt(dot.dataset.slide)));
    });
  }

  setInterval(() => setSlide((current + 1) % slides.length), 6000);
}

/* ===== NAVBAR SCROLL ===== */
function initNavbarScroll() {
  const navbar = document.querySelector('.sarwiri-navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ===== ACTIVE NAV LINK ===== */
function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sarwiri-navbar .nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ===== HERO SEARCH (index.html) ===== */
function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = document.getElementById('search-keyword')?.value || '';
    const fecha   = document.getElementById('search-fecha')?.value || '';
    const personas= document.getElementById('search-personas')?.value || '';
    const params  = new URLSearchParams();
    if (keyword)  params.set('q', keyword);
    if (fecha)    params.set('fecha', fecha);
    if (personas) params.set('personas', personas);
    window.location.href = `tours.html?${params.toString()}`;
  });
}

/* ===== TOURS PAGE LOGIC ===== */
function initToursPage() {
  const grid = document.getElementById('tours-grid');
  if (!grid) return;

  let filtered = [...TOURS_DATA];
  const params = new URLSearchParams(window.location.search);
  let keyword = params.get('q') || '';
  let fecha    = params.get('fecha') || '';
  let personas = parseInt(params.get('personas')) || 0;
  let catActiva = 'todos';

  // Set initial filter values
  const kInput = document.getElementById('filter-keyword');
  const fInput = document.getElementById('filter-fecha');
  const pInput = document.getElementById('filter-personas');
  if (kInput && keyword) kInput.value = keyword;
  if (fInput && fecha)   fInput.value = fecha;
  if (pInput && personas) pInput.value = personas;

  function applyFilters() {
    const kw = document.getElementById('filter-keyword')?.value.toLowerCase().trim() || '';
    const fe = document.getElementById('filter-fecha')?.value || '';
    const pe = parseInt(document.getElementById('filter-personas')?.value) || 0;

    filtered = TOURS_DATA.filter(t => {
      const matchKw  = !kw || t.nombre.toLowerCase().includes(kw) || t.descripcion.toLowerCase().includes(kw) || t.destino.toLowerCase().includes(kw);
      const matchCat = catActiva === 'todos' || t.categoria === catActiva;
      const matchPe  = !pe || t.personas_max >= pe;
      return matchKw && matchCat && matchPe;
    });

    renderGrid();
  }

  function renderGrid() {
    const count = document.getElementById('results-count');
    if (count) count.innerHTML = `Mostrando <strong>${filtered.length}</strong> de ${TOURS_DATA.length} tours`;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="no-results">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h4>No encontramos tours</h4>
            <p>Intenta con otro término de búsqueda o cambia los filtros.</p>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(t => renderTourCard(t)).join('');
    setTimeout(initScrollAnimations, 50);
  }

  // Filter form
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => { e.preventDefault(); applyFilters(); });
  }

  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterForm?.reset();
      catActiva = 'todos';
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      document.querySelector('.cat-pill[data-cat="todos"]')?.classList.add('active');
      applyFilters();
    });
  }

  // Category pills
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      catActiva = pill.dataset.cat;
      applyFilters();
    });
  });

  // Live search
  document.getElementById('filter-keyword')?.addEventListener('input', () => {
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(applyFilters, 300);
  });

  applyFilters();
}

/* ===== INDEX PAGE — Popular Tours ===== */
function initIndexTours() {
  const grid = document.getElementById('popular-tours-grid');
  if (!grid) return;

  const populares = TOURS_DATA.filter(t => t.popular);
  grid.innerHTML = populares.map(t => renderTourCard(t, true)).join('');
  setTimeout(initScrollAnimations, 100);
}

/* ===== INDEX PAGE — Destinos ===== */
function initIndexDestinos() {
  const grid = document.getElementById('destinos-grid');
  if (!grid) return;

  grid.innerHTML = DESTINOS_DATA.map((d, i) => `
    <div class="col-md-4 col-sm-6 mb-4 fade-up">
      <a class="destino-card ${i === 0 ? 'destino-card-lg' : ''}" href="destinos.html" style="display:block; text-decoration:none;">
        <img src="${d.imagen}" alt="${d.nombre}" loading="lazy">
        <div class="destino-overlay">
          <div class="destino-name">${d.nombre}</div>
          <div class="destino-count">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            ${d.tours} tours disponibles
          </div>
        </div>
      </a>
    </div>
  `).join('');

  setTimeout(initScrollAnimations, 100);
}

/* ===== DESTINOS PAGE ===== */
function initDestinosPage() {
  const grid = document.getElementById('destinos-page-grid');
  if (!grid) return;

  grid.innerHTML = DESTINOS_DATA.map(d => `
    <div class="col-md-4 col-sm-6 mb-4 fade-up">
      <a class="destino-page-card" href="tours.html?q=${encodeURIComponent(d.nombre)}">
        <img src="${d.imagen}" alt="${d.nombre}" loading="lazy">
        <div class="destino-page-info">
          <div class="destino-page-name">${d.nombre}</div>
          <div class="destino-page-desc">${d.descripcion}</div>
          <span class="destino-page-tag">${d.tours} tours</span>
        </div>
      </a>
    </div>
  `).join('');

  setTimeout(initScrollAnimations, 100);
}

/* ===== RESERVAS PAGE ===== */
function initReservaPage() {
  const params = new URLSearchParams(window.location.search);
  const tourId = parseInt(params.get('tour')) || 1;
  const tour   = TOURS_DATA.find(t => t.id === tourId) || TOURS_DATA[0];

  // Fill tour selector
  const selectTour = document.getElementById('res-tour');
  if (selectTour) {
    TOURS_DATA.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.nombre} — ${formatCLP(t.precio)}/persona`;
      if (t.id === tour.id) opt.selected = true;
      selectTour.appendChild(opt);
    });
  }

  // Tour summary
  function updateSummary() {
    const selectedId = parseInt(document.getElementById('res-tour')?.value) || tour.id;
    const selectedTour = TOURS_DATA.find(t => t.id === selectedId) || tour;
    const personas = parseInt(document.getElementById('res-personas')?.value) || 1;
    const total = selectedTour.precio * personas;

    const summaryImg = document.getElementById('summary-img');
    if (summaryImg) {
      summaryImg.src = selectedTour.imagen;
      summaryImg.alt = selectedTour.nombre;
    }
    const el = id => document.getElementById(id);
    if (el('summary-tour-name')) el('summary-tour-name').textContent = selectedTour.nombre;
    if (el('summary-duracion'))  el('summary-duracion').textContent = selectedTour.duracion;
    if (el('summary-destino'))   el('summary-destino').textContent = selectedTour.destino;
    if (el('summary-precio-unit')) el('summary-precio-unit').textContent = formatCLP(selectedTour.precio);
    if (el('summary-personas'))  el('summary-personas').textContent = personas + (personas === 1 ? ' persona' : ' personas');
    if (el('summary-total'))     el('summary-total').textContent = formatCLP(total);
  }

  document.getElementById('res-tour')?.addEventListener('change', updateSummary);
  document.getElementById('res-personas')?.addEventListener('change', updateSummary);
  updateSummary();

  // Min date = today
  const fechaInput = document.getElementById('res-fecha');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
  }

  // Form submit
  const form = document.getElementById('reserva-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToastSarwiri('¡Reserva solicitada!', '✅ Te contactaremos para confirmar tu tour.', 'success');
      // Mark steps
      document.querySelector('.step-num[data-step="2"]')?.classList.add('done');
      document.querySelector('.step-num[data-step="2"]')?.classList.remove('active');
      document.querySelector('.step-label[data-step="2"]')?.classList.add('done');
      document.querySelector('.step-label[data-step="2"]')?.classList.remove('active');
      document.querySelector('.step-num[data-step="3"]')?.classList.add('active');
      document.querySelector('.step-label[data-step="3"]')?.classList.add('active');
      document.querySelector('.step-line[data-step="2"]')?.classList.add('done');

      setTimeout(() => {
        const btn = document.getElementById('wa-redirect-btn');
        if (btn) btn.classList.remove('hidden');
      }, 1500);
    });
  }
}

/* ===== TOAST ===== */
function showToastSarwiri(title, msg, type = 'info') {
  let container = document.querySelector('.toast-container-sarwiri');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container-sarwiri';
    document.body.appendChild(container);
  }

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    danger:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast-sarwiri toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<strong>${title}</strong> — ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ===== INIT ALL ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  setActiveNavLink();
  initHeroSlider();
  initHeroSearch();
  initIndexTours();
  initIndexDestinos();
  initToursPage();
  initDestinosPage();
  initReservaPage();
  setTimeout(initScrollAnimations, 200);

  // WhatsApp tooltip hover
  const floatBtn = document.querySelector('.whatsapp-float');
  if (floatBtn) {
    floatBtn.addEventListener('mouseenter', () => {
      floatBtn.querySelector('.whatsapp-float-tooltip')?.style && (floatBtn.querySelector('.whatsapp-float-tooltip').style.opacity = '1');
    });
  }
});
