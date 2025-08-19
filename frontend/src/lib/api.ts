export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// user types
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role?: 'user' | 'admin';
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
}

export interface ReplaceUserRequest {
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export async function getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`, {
        credentials: 'include' // usefule later with auth
    });
    if(!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json() as Promise<{ status: string; service: string; ts: number }>;
}

// CRUD operations

// GET: all users
export async function getUsers(): Promise<User[]>{
    const res = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    return res.json();
}

// POST: create user
export async function createUser(user: CreateUserRequest): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user)
    });
    if(!res.ok) throw new Error(`Failed to create user: ${res.status}`);
    return res.json();
}

// PATCH: update user
export async function updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update user ${res.status}`);
    return res.json();
}

// PUT: replace user
export async function replaceUser(id: string, user: ReplaceUserRequest): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error(`Failed to replace user: ${res.status}`);
    return res.json();
}

// DELETE: remove user
export async function deleteUser(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
    return res.json();
}
