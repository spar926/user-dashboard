export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`, {
        credentials: 'include' // usefule later with auth
    });
    if(!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json() as Promise<{ status: string; service: string; ts: number }>;
}