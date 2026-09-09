const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (includeContentType = true) => {
  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('deadlinehub_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const normalizeDeadline = (item) => {
  if (!item) return item;
  return {
    ...item,
    id: item._id || item.id,
  };
};

const normalizeAnnouncement = (item) => {
  if (!item) return item;
  const p = item.priority || 'Normal';
  return {
    ...item,
    id: item._id || item.id,
    priorityVariant: item.priorityVariant || p.toLowerCase(),
    priorityText: item.priorityText || p.toUpperCase(),
    postedAt: item.postedAt || item.createdAt || new Date(),
  };
};

async function handleResponse(res) {
  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // response was not JSON
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const deadlineApi = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/deadlines`, {
      headers: getAuthHeaders(false),
    });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data.map(normalizeDeadline) : [];
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/deadlines/${id}`, {
      headers: getAuthHeaders(false),
    });
    const data = await handleResponse(res);
    return normalizeDeadline(data);
  },

  async create(deadlineData) {
    const res = await fetch(`${API_BASE_URL}/deadlines`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(deadlineData),
    });
    const data = await handleResponse(res);
    return normalizeDeadline(data);
  },

  async update(id, deadlineData) {
    const res = await fetch(`${API_BASE_URL}/deadlines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(deadlineData),
    });
    const data = await handleResponse(res);
    return normalizeDeadline(data);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/deadlines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },
};

export const announcementApi = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      headers: getAuthHeaders(false),
    });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data.map(normalizeAnnouncement) : [];
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      headers: getAuthHeaders(false),
    });
    const data = await handleResponse(res);
    return normalizeAnnouncement(data);
  },

  async create(announcementData) {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(announcementData),
    });
    const data = await handleResponse(res);
    return normalizeAnnouncement(data);
  },

  async update(id, announcementData) {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(announcementData),
    });
    const data = await handleResponse(res);
    return normalizeAnnouncement(data);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },
};

export const authApi = {
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },
};
