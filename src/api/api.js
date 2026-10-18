const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).trim().replace(/\/+$/, '');

const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

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

    if (res.status === 401 && typeof window !== 'undefined') {
      const isAuthPath = res.url && (res.url.includes('/api/auth/login') || res.url.includes('/api/auth/register'));
      if (!isAuthPath) {
        window.dispatchEvent(new CustomEvent('deadlinehub:unauthorized'));
      }
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

export const classApi = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getMyClasses() {
    const res = await fetch(`${API_BASE_URL}/classes/my-classes`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async create(classData) {
    const res = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(classData),
    });
    return handleResponse(res);
  },

  async join(classCode) {
    const res = await fetch(`${API_BASE_URL}/classes/join`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ classCode }),
    });
    return handleResponse(res);
  },

  async update(id, classData) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(classData),
    });
    return handleResponse(res);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getContent(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}/content`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async leave(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(true),
    });
    return handleResponse(res);
  },

  async removeStudent(classId, studentId) {
    const res = await fetch(`${API_BASE_URL}/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },
};

export const notificationApi = {
  async getAll({ limit = 50, page = 1, unreadOnly = false } = {}) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (page) params.set('page', page);
    if (unreadOnly) params.set('unreadOnly', 'true');
    const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getUnreadCount() {
    const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async markAsRead(id) {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
    });
    return handleResponse(res);
  },

  async markAllAsRead() {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
    });
    return handleResponse(res);
  },
};

export const joinRequestApi = {
  async getAll({ status } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const res = await fetch(`${API_BASE_URL}/join-requests?${params.toString()}`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async getPending() {
    return this.getAll({ status: 'pending' });
  },

  async getHistory() {
    const res = await fetch(`${API_BASE_URL}/join-requests/history`, {
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },

  async create(data) {
    const res = await fetch(`${API_BASE_URL}/join-requests`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async approve(id) {
    const res = await fetch(`${API_BASE_URL}/join-requests/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
    });
    return handleResponse(res);
  },

  async reject(id) {
    const res = await fetch(`${API_BASE_URL}/join-requests/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
    });
    return handleResponse(res);
  },

  async cancel(id) {
    const res = await fetch(`${API_BASE_URL}/join-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    return handleResponse(res);
  },
};

