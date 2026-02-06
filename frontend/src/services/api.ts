/**
 * API Service
 * 
 * @description
 * Centralized API client for all backend communication. Provides methods
 * for user management and appointment operations including CRUD operations,
 * availability checks, and time slot queries.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Advocate API
export const advocateAPI = {
  async getAll(cursor?: string, pageSize?: number) {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (pageSize) params.append('pageSize', pageSize.toString());
    const response = await fetch(`${API_BASE_URL}/advocates?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch advocates');
    return response.json();
  }
};

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
