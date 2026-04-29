// src/services/trcService.js — pakai shared store
import { getTrcUnitsState, patchTrcUnit } from '@/data/store';

const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function getTrcUnits() {
  await simulateDelay();
  return getTrcUnitsState();
}

export async function getTrcUnitById(id) {
  await simulateDelay(200);
  const unit = getTrcUnitsState().find((t) => t.id === id);
  if (!unit) throw new Error('Unit TRC tidak ditemukan.');
  return unit;
}

export async function updateTrcStatus(id, payload) {
  await simulateDelay(200);
  patchTrcUnit(id, { ...payload, waktu_update: new Date().toISOString() });
  return { message: 'Status TRC diperbarui.', id };
}
