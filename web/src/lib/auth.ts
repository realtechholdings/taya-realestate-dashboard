import { User } from '../types';

export async function getCurrentUser(): Promise<User> {
  // Mock auth for Phase 2A - temporarily set to admin for testing
  return {
    id: 'taya-001',
    name: 'Taya Rich',
    initials: 'TR',
    role: 'admin' as const, // Changed to admin for Phase 2A testing
  };
}