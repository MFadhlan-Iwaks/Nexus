// src/data/store.js
// ============================================================
// NEXUS — Shared Mutable State (Session-level)
// ============================================================
// Module ini berperan sebagai "in-memory database" selama sesi
// berlangsung. Saat TRC mengubah laporan, admin langsung membaca
// data terbaru dari sini.
//
// Saat backend siap, cukup ganti fungsi di service layer
// untuk memanggil API — store ini tidak perlu diubah oleh UI.
// ============================================================

import {
  mockReports,
  mockBroadcasts,
  mockLogistics,
  mockFaskes,
  mockUsers,
  mockTrcUnits,
  mockStockHistory,
} from '@/data/mockData';

// ─── REPORTS ─────────────────────────────────────────────────
let _reports = mockReports.map((r) => ({ ...r, trc: r.trc ? { ...r.trc } : null }));

export function getReportsState() {
  return [..._reports];
}

/** Perbarui field-field pada laporan (root level, mis: status) */
export function patchReport(id, changes) {
  _reports = _reports.map((r) => (r.id === id ? { ...r, ...changes } : r));
}

/** Perbarui field-field di dalam objek trc dari sebuah laporan */
export function patchReportTrc(id, trcChanges) {
  _reports = _reports.map((r) => {
    if (r.id !== id) return r;
    return { ...r, trc: { ...(r.trc || {}), ...trcChanges } };
  });
}

// ─── BROADCASTS ──────────────────────────────────────────────
let _broadcasts = [...mockBroadcasts];

export function getBroadcastsState() {
  return [..._broadcasts];
}

export function addBroadcast(broadcast) {
  _broadcasts = [broadcast, ..._broadcasts];
}

export function removeBroadcast(id) {
  _broadcasts = _broadcasts.filter((b) => b.id !== id);
}

// ─── LOGISTICS ───────────────────────────────────────────────
let _logistics = mockLogistics.map((i) => ({ ...i }));

export function getLogisticsState() {
  return [..._logistics];
}

export function patchLogistic(id, changes) {
  _logistics = _logistics.map((i) => (i.id === id ? { ...i, ...changes } : i));
}

export function addLogistic(item) {
  _logistics = [item, ..._logistics];
}

// ─── FASKES ──────────────────────────────────────────────────
let _faskes = mockFaskes.map((i) => ({ ...i }));

export function getFaskesState() {
  return [..._faskes];
}

export function patchFaskes(id, changes) {
  _faskes = _faskes.map((i) => (i.id === id ? { ...i, ...changes } : i));
}

export function addFaskes(item) {
  _faskes = [item, ..._faskes];
}

// ─── USERS ───────────────────────────────────────────────────
let _users = mockUsers.map((u) => ({ ...u }));

export function getUsersState() {
  return [..._users];
}

export function patchUser(id, changes) {
  _users = _users.map((u) => (u.id === id ? { ...u, ...changes } : u));
}

// ─── TRC UNITS ───────────────────────────────────────────────
let _trcUnits = mockTrcUnits.map((t) => ({ ...t }));

export function getTrcUnitsState() {
  return [..._trcUnits];
}

export function patchTrcUnit(id, changes) {
  _trcUnits = _trcUnits.map((t) => (t.id === id ? { ...t, ...changes } : t));
}

// ─── STOCK HISTORY ───────────────────────────────────────────
let _stockHistory = mockStockHistory.map((h) => ({ ...h }));

export function getStockHistoryState() {
  return [..._stockHistory];
}

export function addStockHistory(entry) {
  _stockHistory = [entry, ..._stockHistory];
}
