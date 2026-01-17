const API_BASE_URL = 'http://localhost:3000';

// User API
export const userAPI = {
  async create(email: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create user: ${response.status}`);
    }
    return response.json();
  },

  async getAll() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async findByEmail(email: string) {
    const users = await this.getAll();
    return users.find((user: any) => user.email === email);
  },
};

// Appointment API
export const appointmentAPI = {
  async create(userId: string, startTime: string, endTime: string, description: string) {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, startTime, endTime, title: description }),
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  async getAll() {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },

  async getAvailableSlots(date: string) {
    const response = await fetch(`${API_BASE_URL}/appointments/available-time-slots?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch available slots');
    return response.json();
  },

  async getByUserId(userId: string) {
    const response = await fetch(`${API_BASE_URL}/appointments/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch appointments for user');
    return response.json(); 
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update appointment');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete appointment');
  },
};
