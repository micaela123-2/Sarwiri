/* ==========================================================================
   ReservaUO - CLIENTE API REST
   ========================================================================== */

const API_BASE = '/api';

const API = {
  // --- AUTENTICACIÓN Y USUARIOS ---
  login: async (correo, contrasena) => {
    return await request('/auth/login', 'POST', { correo, contrasena });
  },

  register: async (userData) => {
    return await request('/auth/register', 'POST', userData);
  },

  recoverPassword: async (correo, nuevaContrasena) => {
    return await request('/auth/recover', 'POST', { correo, nuevaContrasena });
  },

  updateProfile: async (userId, profileData) => {
    return await request(`/auth/profile/${userId}`, 'PUT', profileData);
  },

  // --- ESPACIOS COMUNES ---
  getEspacios: async () => {
    return await request('/espacios', 'GET');
  },

  createEspacio: async (spaceData) => {
    return await request('/espacios', 'POST', spaceData);
  },

  updateEspacio: async (spaceId, spaceData) => {
    return await request(`/espacios/${spaceId}`, 'PUT', spaceData);
  },

  deleteEspacio: async (spaceId) => {
    return await request(`/espacios/${spaceId}`, 'DELETE');
  },

  // --- RESERVAS ---
  getReservas: async (userId = null) => {
    const endpoint = userId ? `/reservas?id_usuario=${userId}` : '/reservas';
    return await request(endpoint, 'GET');
  },

  createReserva: async (reservaData) => {
    return await request('/reservas', 'POST', reservaData);
  },

  updateReservaEstado: async (reservaId, estado) => {
    return await request(`/reservas/${reservaId}/estado`, 'PUT', { estado });
  },

  // --- MÉTRICAS DE ADMINISTRACIÓN ---
  getAdminStats: async () => {
    return await request('/admin/stats', 'GET');
  }
};

// Función auxiliar para realizar peticiones fetch
async function request(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Devolver error controlado
      throw new Error(data.error || 'Ocurrió un error inesperado al procesar la solicitud.');
    }

    return data;
  } catch (error) {
    console.error(`❌ Error en petición [${method}] ${url}:`, error.message);
    throw error;
  }
}
