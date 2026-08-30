const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isMock = process.env.DB_MOCK === 'true';

// Base de datos simulada en memoria
const mockDb = {
  usuarios: [
    { id_usuario: 1, nombre: 'Carlos', apellido: 'Mendoza', correo: 'admin@reservauo.cl', contrasena: 'admin123', rol: 'administrador' },
    { id_usuario: 2, nombre: 'María', apellido: 'López', correo: 'residente1@reservauo.cl', contrasena: 'residente123', rol: 'residente' },
    { id_usuario: 3, nombre: 'Diego', apellido: 'Silva', correo: 'residente2@reservauo.cl', contrasena: 'residente123', rol: 'residente' }
  ],
  departamentos: [
    { id_departamento: 1, numero: '101', torre: 'Torre A', id_usuario: 2 },
    { id_departamento: 2, numero: '205', torre: 'Torre B', id_usuario: 3 },
    { id_departamento: 3, numero: '301', torre: 'Torre A', id_usuario: null },
    { id_departamento: 4, numero: '404', torre: 'Torre C', id_usuario: null }
  ],
  espacios: [
    { id_espacio: 1, nombre: 'Lavandería', descripcion: 'Equipada con lavadoras y secadoras de alta tecnología. Ideal para cargas grandes. Límite de 2 horas por turno.', capacidad: 4, imagen: 'lavanderia' },
    { id_espacio: 2, nombre: 'Quincho', descripcion: 'Espacio al aire libre con parrilla grande, mesas y lavadero. Perfecto para reuniones y asados familiares.', capacidad: 15, imagen: 'quincho' },
    { id_espacio: 3, nombre: 'Gimnasio', descripcion: 'Equipamiento cardiovascular completo, pesas libres y máquinas de fuerza. Climatizado y con música ambiental.', capacidad: 8, imagen: 'gimnasio' },
    { id_espacio: 4, nombre: 'Sala de eventos', descripcion: 'Salón cerrado con mesas, sillas, cocina equipada, aire acondicionado y equipo de sonido para eventos sociales.', capacidad: 40, imagen: 'sala_eventos' },
    { id_espacio: 5, nombre: 'Estacionamiento de visitas', descripcion: 'Aparcamiento seguro dentro del condominio para vehículos de familiares o amigos. Límite máximo de 6 horas.', capacidad: 1, imagen: 'estacionamiento' }
  ],
  reservas: [
    { id_reserva: 1, id_usuario: 2, id_espacio: 3, fecha: '2026-07-04', hora_inicio: '08:00:00', hora_fin: '10:00:00', estado: 'confirmada' },
    { id_reserva: 2, id_usuario: 2, id_espacio: 2, fecha: '2026-07-05', hora_inicio: '13:00:00', hora_fin: '17:00:00', estado: 'confirmada' },
    { id_reserva: 3, id_usuario: 3, id_espacio: 4, fecha: '2026-07-05', hora_inicio: '18:00:00', hora_fin: '22:00:00', estado: 'confirmada' },
    { id_reserva: 4, id_usuario: 3, id_espacio: 1, fecha: '2026-07-04', hora_inicio: '14:00:00', hora_fin: '16:00:00', estado: 'confirmada' }
  ]
};

// Contadores para IDs simulados
let nextUserId = 4;
let nextDeptId = 5;
let nextEspacioId = 6;
let nextReservaId = 5;

// Inicializar conexión
async function initDb() {
  if (isMock) {
    console.log('⚡ MODO SIMULACIÓN: Usando base de datos en memoria (DB_MOCK=true).');
    return;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'reservauo_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Base de datos MySQL conectada con éxito.');
    connection.release();
  } catch (err) {
    console.warn('⚠️ Error al conectar con MySQL:', err.message);
    console.log('⚡ Entrando en MODO SIMULACIÓN automáticamente (fallback).');
    isMock = true;
  }
}

// Ejecutar consulta SQL real o simularla
async function query(sql, params = []) {
  if (!isMock && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('❌ Error ejecutando query en MySQL:', err.message);
      throw err;
    }
  }

  // Lógica de Simulación SQL (Mock DB)
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');
  
  // 1. SELECT * FROM usuarios WHERE correo = ?
  if (normalizedSql.match(/SELECT \* FROM usuarios WHERE correo = \?/i)) {
    const email = params[0];
    const user = mockDb.usuarios.find(u => u.correo.toLowerCase() === email.toLowerCase());
    return user ? [user] : [];
  }

  // 2. INSERT INTO usuarios
  if (normalizedSql.match(/INSERT INTO usuarios/i)) {
    const [nombre, apellido, correo, contrasena, rol] = params;
    const nuevoUsuario = { id_usuario: nextUserId++, nombre, apellido, correo, contrasena, rol };
    mockDb.usuarios.push(nuevoUsuario);
    return { insertId: nuevoUsuario.id_usuario, affectedRows: 1 };
  }

  // 3. UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id_usuario = ?
  if (normalizedSql.match(/UPDATE usuarios SET nombre = \?, apellido = \?, correo = \? WHERE id_usuario = \?/i)) {
    const [nombre, apellido, correo, id] = params;
    const user = mockDb.usuarios.find(u => u.id_usuario === parseInt(id));
    if (user) {
      user.nombre = nombre;
      user.apellido = apellido;
      user.correo = correo;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 4. UPDATE usuarios SET contrasena = ? WHERE correo = ? (recuperación)
  if (normalizedSql.match(/UPDATE usuarios SET contrasena = \? WHERE correo = \?/i)) {
    const [contrasena, correo] = params;
    const user = mockDb.usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase());
    if (user) {
      user.contrasena = contrasena;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 5. SELECT * FROM departamentos
  if (normalizedSql.match(/SELECT \* FROM departamentos/i) && !normalizedSql.includes('WHERE')) {
    return mockDb.departamentos;
  }

  // 6. SELECT * FROM departamentos WHERE id_usuario = ?
  if (normalizedSql.match(/SELECT \* FROM departamentos WHERE id_usuario = \?/i)) {
    const userId = params[0];
    const dept = mockDb.departamentos.find(d => d.id_usuario === parseInt(userId));
    return dept ? [dept] : [];
  }

  // 7. UPDATE departamentos SET id_usuario = ? WHERE id_departamento = ?
  if (normalizedSql.match(/UPDATE departamentos SET id_usuario = \? WHERE id_departamento = \?/i)) {
    const [userId, deptId] = params;
    const dept = mockDb.departamentos.find(d => d.id_departamento === parseInt(deptId));
    if (dept) {
      dept.id_usuario = userId ? parseInt(userId) : null;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 8. SELECT * FROM espacios
  if (normalizedSql.match(/SELECT \* FROM espacios/i)) {
    return mockDb.espacios;
  }

  // 9. INSERT INTO espacios
  if (normalizedSql.match(/INSERT INTO espacios/i)) {
    const [nombre, descripcion, capacidad, imagen] = params;
    const nuevoEspacio = { id_espacio: nextEspacioId++, nombre, descripcion, capacidad: parseInt(capacidad), imagen };
    mockDb.espacios.push(nuevoEspacio);
    return { insertId: nuevoEspacio.id_espacio, affectedRows: 1 };
  }

  // 10. UPDATE espacios SET nombre = ?, descripcion = ?, capacidad = ? WHERE id_espacio = ?
  if (normalizedSql.match(/UPDATE espacios SET nombre = \?, descripcion = \?, capacidad = \? WHERE id_espacio = \?/i)) {
    const [nombre, descripcion, capacidad, id] = params;
    const espacio = mockDb.espacios.find(e => e.id_espacio === parseInt(id));
    if (espacio) {
      espacio.nombre = nombre;
      espacio.descripcion = descripcion;
      espacio.capacidad = parseInt(capacidad);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 11. DELETE FROM espacios WHERE id_espacio = ?
  if (normalizedSql.match(/DELETE FROM espacios WHERE id_espacio = \?/i)) {
    const id = params[0];
    const index = mockDb.espacios.findIndex(e => e.id_espacio === parseInt(id));
    if (index !== -1) {
      mockDb.espacios.splice(index, 1);
      // Eliminar reservas asociadas
      mockDb.reservas = mockDb.reservas.filter(r => r.id_espacio !== parseInt(id));
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 12. SELECT * FROM reservas WHERE id_espacio = ? AND fecha = ? AND estado != 'cancelada' AND estado != 'rechazada'
  if (normalizedSql.match(/SELECT \* FROM reservas WHERE id_espacio = \? AND fecha = \? AND estado != 'cancelada' AND estado != 'rechazada'/i)) {
    const [espacioId, fecha] = params;
    return mockDb.reservas.filter(r => 
      r.id_espacio === parseInt(espacioId) && 
      r.fecha === fecha && 
      r.estado !== 'cancelada' && 
      r.estado !== 'rechazada'
    );
  }

  // 13. INSERT INTO reservas (id_usuario, id_espacio, fecha, hora_inicio, hora_fin, estado)
  if (normalizedSql.match(/INSERT INTO reservas/i)) {
    const [id_usuario, id_espacio, fecha, hora_inicio, hora_fin, estado] = params;
    const nuevaReserva = { 
      id_reserva: nextReservaId++, 
      id_usuario: parseInt(id_usuario), 
      id_espacio: parseInt(id_espacio), 
      fecha, 
      hora_inicio, 
      hora_fin, 
      estado: estado || 'confirmada' 
    };
    mockDb.reservas.push(nuevaReserva);
    return { insertId: nuevaReserva.id_reserva, affectedRows: 1 };
  }

  // 14. UPDATE reservas SET estado = ? WHERE id_reserva = ?
  if (normalizedSql.match(/UPDATE reservas SET estado = \? WHERE id_reserva = \?/i)) {
    const [estado, id] = params;
    const reserva = mockDb.reservas.find(r => r.id_reserva === parseInt(id));
    if (reserva) {
      reserva.estado = estado;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 15. SELECT r.*, u.nombre, u.apellido, u.correo, e.nombre AS espacio_nombre, e.capacidad ...
  // Esta es la consulta compleja de listado de reservas con JOINs
  if (normalizedSql.match(/SELECT r\.\*, u\.nombre/i)) {
    // Retornamos todas las reservas con los datos del usuario y espacio combinados
    return mockDb.reservas.map(r => {
      const u = mockDb.usuarios.find(usr => usr.id_usuario === r.id_usuario) || {};
      const e = mockDb.espacios.find(esp => esp.id_espacio === r.id_espacio) || {};
      return {
        ...r,
        nombre: u.nombre || 'Desconocido',
        apellido: u.apellido || '',
        correo: u.correo || '',
        espacio_nombre: e.nombre || 'Espacio Eliminado',
        capacidad: e.capacidad || 0
      };
    });
  }

  // 16. COUNT Queries para el Dashboard
  if (normalizedSql.match(/SELECT COUNT\(\*\) as count FROM usuarios/i)) {
    return [{ count: mockDb.usuarios.length }];
  }
  if (normalizedSql.match(/SELECT COUNT\(\*\) as count FROM reservas/i)) {
    return [{ count: mockDb.reservas.length }];
  }

  console.warn('⚠️ SQL Query no simulada en MockDB:', normalizedSql);
  return [];
}

module.exports = {
  initDb,
  query,
  isMock: () => isMock
};
