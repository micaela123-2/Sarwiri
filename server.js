const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================================
// ENDPOINTS DE AUTENTICACIÓN (LOGIN, REGISTRO, PERFIL)
// ==========================================================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
  }

  try {
    const queryStr = 'SELECT * FROM usuarios WHERE correo = ?';
    const users = await db.query(queryStr, [correo]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Correo no registrado.' });
    }

    const user = users[0];
    
    // Verificación simple de contraseña
    if (user.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Si es residente, buscar información del departamento
    let departamento = null;
    if (user.rol === 'residente') {
      const depts = await db.query('SELECT * FROM departamentos WHERE id_usuario = ?', [user.id_usuario]);
      if (depts.length > 0) {
        departamento = depts[0];
      }
    }

    res.json({
      message: 'Inicio de sesión exitoso.',
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol,
        departamento
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno en el inicio de sesión.' });
  }
});

// Registro (CORREGIDO Y UNIFICADO CON ASYNC/AWAIT)
// Registro (Sincronizado con tabla usuarios y departamentos)
app.post('/api/auth/register', async (req, res) => {
  const { nombre, apellido, correo, contrasena, rol, numeroDepto } = req.body;

  // 1. Validaciones iniciales
  if (!nombre || !apellido || !correo || !contrasena || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para completar el registro.' });
  }

  try {
    // 2. Verificar si el correo ya existe en tu base de datos
    const existing = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // 3. Insertar en la tabla 'usuarios' guardando el numeroDepto directamente
    const userRole = rol === 'administrador' ? 'administrador' : 'residente';
    const insertUserSql = 'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, numeroDepto) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await db.query(insertUserSql, [nombre, apellido, correo, contrasena, userRole, numeroDepto || null]);
    
    const nuevoIdUsuario = result.insertId;

    // 4. Actualizar la tabla 'departamentos' vinculando el id_usuario si corresponde
    if (userRole === 'residente' && numeroDepto) {
      try {
        // Buscamos si existe la fila con ese número de depto en la tabla departamentos
        const depts = await db.query('SELECT * FROM departamentos WHERE numero = ?', [numeroDepto]);
        
        if (depts && depts.length > 0) {
          // Si el departamento existe, le asignamos el id_usuario correspondiente
          await db.query('UPDATE departamentos SET id_usuario = ? WHERE numero = ?', [nuevoIdUsuario, numeroDepto]);
        }
      } catch (deptErr) {
        console.log("Nota: No se pudo actualizar la tabla externa departamentos:", deptErr.message);
      }
    }

    // 5. Enviar respuesta exitosa con código HTTP 201 (Creado) al Frontend
    return res.status(201).json({
      message: 'Usuario registrado con éxito.',
      usuario: {
        id_usuario: nuevoIdUsuario,
        nombre,
        apellido,
        correo,
        rol: userRole,
        numeroDepto
      }
    });

  } catch (err) {
    console.error("Error detallado en MySQL al registrar:", err);
    return res.status(500).json({ error: 'Error interno en el servidor al registrar usuario.' });
  }
});

// Recuperación de Contraseña 
app.post('/api/auth/recover', async (req, res) => {
  const { correo, nuevaContrasena } = req.body;

  if (!correo || !nuevaContrasena) {
    return res.status(400).json({ error: 'Correo y nueva contraseña son obligatorios.' });
  }

  try {
    const result = await db.query('UPDATE usuarios SET contrasena = ? WHERE correo = ?', [nuevaContrasena, correo]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró una cuenta con ese correo.' });
    }

    res.json({ message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al recuperar contraseña.' });
  }
});

// Actualización de Perfil
app.put('/api/auth/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo } = req.body;

  if (!nombre || !apellido || !correo) {
    return res.status(400).json({ error: 'Nombre, apellido y correo son obligatorios.' });
  }

  try {
    const result = await db.query('UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id_usuario = ?', [nombre, apellido, correo, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Perfil actualizado con éxito.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar perfil.' });
  }
});


// ==========================================================================
// ENDPOINTS DE ESPACIOS COMUNES
// ==========================================================================

// Listar espacios
app.get('/api/espacios', async (req, res) => {
  try {
    const espacios = await db.query('SELECT * FROM espacios');
    res.json(espacios);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar los espacios comunes.' });
  }
});

// Agregar espacio (Admin)
app.post('/api/espacios', async (req, res) => {
  const { nombre, descripcion, capacidad, imagen } = req.body;

  if (!nombre || !descripcion || !capacidad || !imagen) {
    return res.status(400).json({ error: 'Todos los campos del espacio son requeridos.' });
  }

  try {
    const sql = 'INSERT INTO espacios (nombre, descripcion, capacidad, imagen) VALUES (?, ?, ?, ?)';
    const result = await db.query(sql, [nombre, descripcion, parseInt(capacidad), imagen]);
    res.status(201).json({
      message: 'Espacio común creado con éxito.',
      espacio: { id_espacio: result.insertId, nombre, descripcion, capacidad, imagen }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear espacio común.' });
  }
});

// Modificar espacio (Admin)
app.put('/api/espacios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, capacidad } = req.body;

  if (!nombre || !descripcion || !capacidad) {
    return res.status(400).json({ error: 'Campos incompletos para actualizar.' });
  }

  try {
    const sql = 'UPDATE espacios SET nombre = ?, descripcion = ?, capacidad = ? WHERE id_espacio = ?';
    const result = await db.query(sql, [nombre, descripcion, parseInt(capacidad), id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado.' });
    }

    res.json({ message: 'Espacio común actualizado con éxito.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar espacio común.' });
  }
});

// Eliminar espacio (Admin)
app.delete('/api/espacios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM espacios WHERE id_espacio = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Espacio no encontrado.' });
    }

    res.json({ message: 'Espacio común eliminado y sus reservas asociadas canceladas.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar espacio común.' });
  }
});


// ==========================================================================
// ENDPOINTS DE RESERVAS
// ==========================================================================

// Obtener todas las reservas
app.get('/api/reservas', async (req, res) => {
  const { id_usuario } = req.query;

  try {
    const sql = `
      SELECT r.*, u.nombre, u.apellido, u.correo, e.nombre AS espacio_nombre, e.capacidad 
      FROM reservas r 
      JOIN usuarios u ON r.id_usuario = u.id_usuario 
      JOIN espacios e ON r.id_espacio = e.id_espacio
      ORDER BY r.fecha DESC, r.hora_inicio ASC
    `;
    const todasLasReservas = await db.query(sql);

    if (id_usuario) {
      const reservasFiltradas = todasLasReservas.filter(r => r.id_usuario === parseInt(id_usuario));
      return res.json(reservasFiltradas);
    }

    res.json(todasLasReservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar las reservas.' });
  }
});

// Crear una nueva reserva
app.post('/api/reservas', async (req, res) => {
  const { id_usuario, id_espacio, fecha, hora_inicio, hora_fin } = req.body;

  if (!id_usuario || !id_espacio || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para crear la reserva.' });
  }

  try {
    const sqlCheck = `
      SELECT * FROM reservas 
      WHERE id_espacio = ? AND fecha = ? AND estado != 'cancelada' AND estado != 'rechazada'
    `;
    const reservasExistentes = await db.query(sqlCheck, [id_espacio, fecha]);

    const conflicto = reservasExistentes.some(r => {
      return (hora_inicio < r.hora_fin) && (hora_fin > r.hora_inicio);
    });

    if (conflicto) {
      return res.status(400).json({ 
        error: 'Conflicto de horario: El espacio ya está reservado en el rango horario solicitado por otro residente.' 
      });
    }

    const sqlInsert = `
      INSERT INTO reservas (id_usuario, id_espacio, fecha, hora_inicio, hora_fin, estado) 
      VALUES (?, ?, ?, ?, ?, 'confirmada')
    `;
    const result = await db.query(sqlInsert, [id_usuario, id_espacio, fecha, hora_inicio, hora_fin]);

    res.status(201).json({
      message: 'Reserva creada con éxito y confirmada.',
      id_reserva: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la reserva.' });
  }
});

// Modificar el estado de la reserva
app.put('/api/reservas/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El nuevo estado es requerido.' });
  }

  try {
    const sql = 'UPDATE reservas SET estado = ? WHERE id_reserva = ?';
    const result = await db.query(sql, [estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    res.json({ message: `Reserva actualizada a estado: ${estado}.` });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la reserva.' });
  }
});
// ==========================================================================
// RUTAS PARA EL MÓDULO DE MULTAS Y SANCIONES
// ==========================================================================
// ==========================================================================
// RUTAS PARA EL MÓDULO DE MULTAS Y SANCIONES (CORREGIDAS A ASYNC/AWAIT)
// ==========================================================================

// A. CREAR UNA NUEVA MULTA (POST /api/multas)
app.post('/api/multas', async (req, res) => {
  const { id_usuario, id_reserva, monto, motivo } = req.body;
  const fecha_emision = new Date().toISOString().split('T')[0]; // Fecha actual YYYY-MM-DD

  // Evitamos que guarde un id_reserva vacío si no viene asociado a una
  const reservaId = id_reserva ? parseInt(id_reserva) : null;

  const query = `
    INSERT INTO multas (id_usuario, id_reserva, monto, motivo, estado, fecha_emision) 
    VALUES (?, ?, ?, ?, 'pendiente', ?)
  `;

  try {
    const result = await db.query(query, [id_usuario, reservaId, monto, motivo, fecha_emision]);
    res.status(201).json({ message: "Multa registrada con éxito", id_multa: result.insertId });
  } catch (err) {
    console.error("Error al insertar multa en MySQL:", err);
    res.status(500).json({ error: "Error interno del servidor al registrar la multa" });
  }
});

// B. OBTENER TODAS LAS MULTAS CON DATOS DEL RESIDENTE (GET /api/multas)
app.get('/api/multas', async (req, res) => {
  // Hacemos un JOIN para traer el nombre del residente y su número de departamento
  const query = `
    SELECT m.*, u.nombre AS nombre_residente, u.numeroDepto 
    FROM multas m
    JOIN usuarios u ON m.id_usuario = u.id_usuario
    ORDER BY m.fecha_emision DESC
  `;

  try {
    const results = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener multas de MySQL:", err);
    res.status(500).json({ error: "Error al obtener el listado de multas" });
  }
});

// C. MARCAR UNA MULTA COMO PAGADA (PUT /api/multas/:id/pagar)
app.put('/api/multas/:id/pagar', async (req, res) => {
  const idFine = req.params.id;
  const query = "UPDATE multas SET estado = 'pagada' WHERE id_multa = ?";

  try {
    const result = await db.query(query, [idFine]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No se encontró la multa especificada" });
    }
    res.json({ message: "Multa marcada como pagada con éxito" });
  } catch (err) {
    console.error("Error al actualizar estado de la multa:", err);
    res.status(500).json({ error: "No se pudo actualizar la multa" });
  }
});


// ==========================================================================
// ENDPOINTS DE ADMINISTRACIÓN (MÉTRICAS Y ESTADÍSTICAS)
// ==========================================================================

// Dashboard Estadísticas (Admin)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const bookingsCount = await db.query('SELECT COUNT(*) as count FROM reservas');
    const espacios = await db.query('SELECT * FROM espacios');

    const sqlReservas = `
      SELECT r.*, u.nombre, u.apellido, e.nombre AS espacio_nombre 
      FROM reservas r 
      JOIN usuarios u ON r.id_usuario = u.id_usuario 
      JOIN espacios e ON r.id_espacio = e.id_espacio
    `;
    const reservas = await db.query(sqlReservas);

    const totalResidentes = usersCount[0]?.count || 0;
    const totalReservas = bookingsCount[0]?.count || 0;

    const usoEspacios = espacios.map(esp => {
      const reservasDelEspacio = reservas.filter(r => r.id_espacio === esp.id_espacio && r.estado === 'confirmada');
      return {
        id_espacio: esp.id_espacio,
        nombre: esp.nombre,
        reservasCount: reservasDelEspacio.length
      };
    });

    res.json({
      stats: {
        totalResidentes,
        totalReservas,
        activos: espacios.length
      },
      usoEspacios,
      todasLasReservas: reservas
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar las estadísticas de administración.' });
  }
});


// ==========================================================================
// INICIALIZACIÓN Y ARRANQUE DEL SERVIDOR
// ==========================================================================

async function startServer() {
  await db.initDb();

  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 Servidor ReservaUO ejecutándose en: http://localhost:${PORT}`);
    console.log(`📌 Modo: ${db.isMock() ? 'SIMULACIÓN OFFLINE' : 'CONEXIÓN MYSQL'}`);
    console.log(`================================================================`);
  });
}

startServer();
