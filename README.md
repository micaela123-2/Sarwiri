# ReservaUO - Sistema de Gestión de Espacios Comunes

**ReservaUO** es una aplicación web full-stack, moderna y profesional, diseñada para la administración y reserva de espacios comunes (Lavandería, Quincho, Gimnasio, Sala de Eventos y Estacionamiento de Visitas) en edificios o condominios. 

Este proyecto ha sido desarrollado como una solución de software lista para ser utilizada como **proyecto académico en asignaturas de Base de Datos y Desarrollo Web**.

---

## 🚀 Características Principales

1. **Autenticación Completa:** Inicio de sesión y registro para residentes y administradores, con asignación opcional de departamentos y recuperación rápida de contraseña.
2. **Dashboard de Residente:** Resumen de próximas reservas programadas, indicadores de disponibilidad y accesos directos.
3. **Gestión de Espacios Comunes:** Listado responsivo en tarjetas con información sobre capacidad, descripción e imágenes representativas de cada área.
4. **Sistema de Reservas Inteligente:** Agenda interactiva con visualización de reservas en tiempo real y **control estricto de colisión de horarios** para evitar dobles reservas.
5. **Panel de Administración Completo:**
   - Supervisión y aprobación/rechazo de todas las reservas del condominio.
   - Panel de control CRUD para añadir, modificar o eliminar espacios comunes.
   - Métricas de uso y gráficos estadísticos dinámicos (Gráfico de Dona y de Barras) desarrollados mediante manipulación de SVGs interactivos.
6. **Robustez Académica (Modo Demo Offline):** 
   Si no se dispone de un servidor MySQL activo en el momento de la evaluación, el backend entra automáticamente en **Modo Simulación**, utilizando una base de datos relacional persistida en memoria. Esto asegura que la aplicación funcione de forma impecable e inmediata en cualquier ordenador.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5 semántico, CSS3 personalizado (con Variables CSS, efectos Glassmorphism y diseño responsive Grid/Flexbox) y JavaScript moderno (ES6).
- **Backend:** Node.js con Express para la API REST.
- **Base de Datos:** MySQL (con controlador relacional optimizado en `mysql2`).
- **Iconos:** Lucide Icons.

---

## 📋 Requisitos Previos

- Tener instalado [Node.js](https://nodejs.org/) (versión 16 o superior recomendado).
- Servidor de base de datos MySQL (por ejemplo, mediante XAMPP, Laragon, WampServer o una instalación nativa de MySQL).

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Clonación / Ubicación del Proyecto
Ubica los archivos del proyecto en tu directorio local de desarrollo. 

### 2. Configurar la Base de Datos MySQL
1. Enciende tu servidor MySQL (por ejemplo, desde el panel de control de XAMPP).
2. Entra a tu administrador de bases de datos preferido (phpMyAdmin, DBeaver, MySQL Workbench, etc.).
3. Crea una base de datos llamada `reservauo_db`:
   ```sql
   CREATE DATABASE reservauo_db;
   ```
4. Importa el archivo [schema.sql](schema.sql) para crear las tablas relacionales y cargar los datos iniciales de prueba:
   ```bash
   # Alternativa por consola
   mysql -u tu_usuario -p reservauo_db < schema.sql
   ```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (o edita el ya existente) utilizando los parámetros de tu servidor:

```env
PORT=3000

# Credenciales de MySQL
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=reservauo_db

# Cambiar a 'false' para conectar a tu MySQL real. 
# Si está en 'true', se simulará la base de datos en memoria para pruebas rápidas.
DB_MOCK=false
```

### 4. Instalar Dependencias
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```

### 5. Ejecutar la Aplicación
Para iniciar el servidor en modo de desarrollo (con recarga automática mediante `nodemon`):
```bash
npm run dev
```

O para iniciar el servidor en producción:
```bash
npm start
```

La consola confirmará el puerto de escucha y el modo activo:
```text
================================================================
🚀 Servidor ReservaUO ejecutándose en: http://localhost:3000
📌 Modo: CONEXIÓN MYSQL
================================================================
```

---

## 👤 Cuentas de Demostración Iniciales

Una vez importado el archivo `schema.sql` (o en Modo Demo), puedes iniciar sesión con las siguientes cuentas de prueba:

* **Administrador:**
  - **Correo:** `admin@reservauo.cl`
  - **Contraseña:** `admin123`
  - *Permisos:* Ver todas las reservas, aprobar/rechazar solicitudes, crear/editar/eliminar espacios y consultar gráficos de analíticas.
  
* **Residente de Prueba 1:**
  - **Correo:** `residente1@reservauo.cl`
  - **Contraseña:** `residente123`
  - *Permisos:* Ver disponibilidad en tiempo real, reservar espacios comunes (por ejemplo, Gimnasio, Lavandería, Quincho), ver y cancelar sus propias reservas activas.

* **Residente de Prueba 2:**
  - **Correo:** `residente2@reservauo.cl`
  - **Contraseña:** `residente123`

---

## 📁 Estructura del Proyecto

* `schema.sql`: Script DDL y DML para MySQL.
* `db.js`: Conexión MySQL y lógica inteligente de conmutación al Modo Simulación.
* `server.js`: Servidor Express, enrutador de las APIs REST y lógica de validación de colisiones horarias.
* `public/`: Archivos estáticos del Frontend.
  - `index.html`: Estructura principal e interfaz de usuario SPA.
  - `css/styles.css`: Estilos visuales premium, adaptabilidad móvil y animaciones.
  - `js/api.js`: Cliente de peticiones Fetch HTTP.
  - `js/app.js`: Lógica del cliente, renderizado reactivo y gráficos SVG.
