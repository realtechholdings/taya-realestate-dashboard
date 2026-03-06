import { User } from '../types';

export async function getCurrentUser(): Promise<User> {
  // Mock auth for Phase 1 - hardcoded user
  return {
    id: 'taya-001',
    name: 'Taya Rich',
    initials: 'TR',
    role: 'agent' as const, // Change to 'admin' to test admin route
  };
}