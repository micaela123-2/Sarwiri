-- ==========================================
-- ReservaUO - Definición del Modelo Relacional
-- ==========================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS reservauo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reservauo_db;

-- 1. Tabla: Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL, -- Almacenará contraseñas en texto claro para fines académicos o hash simple
    rol ENUM('residente', 'administrador') NOT NULL DEFAULT 'residente'
) ENGINE=InnoDB;

-- 2. Tabla: Departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    torre VARCHAR(50) NOT NULL,
    id_usuario INT NULL,
    CONSTRAINT fk_departamento_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Tabla: Espacios
CREATE TABLE IF NOT EXISTS espacios (
    id_espacio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    capacidad INT NOT NULL,
    imagen VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 4. Tabla: Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_espacio INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'confirmada',
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_espacio FOREIGN KEY (id_espacio) 
        REFERENCES espacios(id_espacio) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- Inserción de Datos Iniciales (Seed Data)
-- ==========================================

-- Usuarios de prueba
-- (Administrador: admin@reservauo.cl / admin123)
-- (Residente 1: residente1@reservauo.cl / residente123)
-- (Residente 2: residente2@reservauo.cl / residente123)
INSERT INTO usuarios (id_usuario, nombre, apellido, correo, contrasena, rol) VALUES
(1, 'Carlos', 'Mendoza', 'admin@reservauo.cl', 'admin123', 'administrador'),
(2, 'María', 'López', 'residente1@reservauo.cl', 'residente123', 'residente'),
(3, 'Diego', 'Silva', 'residente2@reservauo.cl', 'residente123', 'residente');

-- Departamentos
INSERT INTO departamentos (id_departamento, numero, torre, id_usuario) VALUES
(1, '101', 'Torre A', 2),
(2, '205', 'Torre B', 3),
(3, '301', 'Torre A', NULL),
(4, '404', 'Torre C', NULL);

-- Espacios comunes
INSERT INTO espacios (id_espacio, nombre, descripcion, capacidad, imagen) VALUES
(1, 'Lavandería', 'Equipada con lavadoras y secadoras de alta tecnología. Ideal para cargas grandes. Límite de 2 horas por turno.', 4, 'lavanderia'),
(2, 'Quincho', 'Espacio al aire libre con parrilla grande, mesas y lavadero. Perfecto para reuniones y asados familiares.', 15, 'quincho'),
(3, 'Gimnasio', 'Equipamiento cardiovascular completo, pesas libres y máquinas de fuerza. Climatizado y con música ambiental.', 8, 'gimnasio'),
(4, 'Sala de eventos', 'Salón cerrado con mesas, sillas, cocina equipada, aire acondicionado y equipo de sonido para eventos sociales.', 40, 'sala_eventos'),
(5, 'Estacionamiento de visitas', 'Aparcamiento seguro dentro del condominio para vehículos de familiares o amigos. Límite máximo de 6 horas.', 1, 'estacionamiento');

-- Reservas iniciales de prueba (Fechas basadas en Julio 2026 para testing activo)
INSERT INTO reservas (id_reserva, id_usuario, id_espacio, fecha, hora_inicio, hora_fin, estado) VALUES
(1, 2, 3, '2026-07-04', '08:00:00', '10:00:00', 'confirmada'), -- Reserva pasada / activa de María en Gym
(2, 2, 2, '2026-07-05', '13:00:00', '17:00:00', 'confirmada'), -- Reserva futura de María en Quincho
(3, 3, 4, '2026-07-05', '18:00:00', '22:00:00', 'confirmada'), -- Reserva futura de Diego en Sala de Eventos
(4, 3, 1, '2026-07-04', '14:00:00', '16:00:00', 'confirmada'); -- Reserva pasada de Diego en Lavandería
