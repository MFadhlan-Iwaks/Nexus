// src/services/userService.js — pakai shared store
import { getUsersState, patchUser } from '@/data/store';

const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function getUsers() {
  await simulateDelay();
  return getUsersState();
}

export async function updateUserRole(id, role) {
  await simulateDelay(200);
  patchUser(id, { role });
  return { message: 'Role berhasil diubah.', id, role };
}

export async function toggleUserStatus(id) {
  await simulateDelay(200);
  const users = getUsersState();
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error('User tidak ditemukan.');
  const newAktif = !(user.aktif ?? user.active ?? true);
  patchUser(id, { aktif: newAktif, active: newAktif });
  return { message: `User berhasil ${newAktif ? 'diaktifkan' : 'dinonaktifkan'}.`, id };
}

export async function deleteUser(id) {
  await simulateDelay(200);
  return { message: 'User berhasil dihapus.', id };
}
