const API_BASE_URL = 'http://localhost:5000/api';

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
    const res = await fetch(`${API_BASE_URL}/deadlines`);
    const data = await handleResponse(res);
    return Array.isArray(data) ? data.map(normalizeDeadline) : [];
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/deadlines/${id}`);
    const data = await handleResponse(res);
    return normalizeDeadline(data);
  },

  async create(deadlineData) {
    const res = await fetch(`${API_BASE_URL}/deadlines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deadlineData),
    });
    const data = await handleResponse(res);
    return normalizeDeadline(data);
  },

  async update(id, deadlineData) {
    const res = await fetch(`${API_BASE_URL}/deadlines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deadlineData),
    });
    const data = await handleResponse(res);
    return normalizeDeadline(data);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/deadlines/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};

export const announcementApi = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/announcements`);
    const data = await handleResponse(res);
    return Array.isArray(data) ? data.map(normalizeAnnouncement) : [];
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`);
    const data = await handleResponse(res);
    return normalizeAnnouncement(data);
  },

  async create(announcementData) {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(announcementData),
    });
    const data = await handleResponse(res);
    return normalizeAnnouncement(data);
  },

  async update(id, announcementData) {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(announcementData),
    });
    const data = await handleResponse(res);
    return normalizeAnnouncement(data);
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
