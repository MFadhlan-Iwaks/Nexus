"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, User } from 'lucide-react';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function UserProfileDropdown({
  defaultProfile,
  roleClassName = 'text-slate-500',
  avatarClassName = 'bg-slate-100 text-slate-700'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const userSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    },
    () => localStorage.getItem('user') || '',
    () => null
  );

  const storedUser = useMemo(() => {
    if (!userSnapshot) return null;
    try {
      return JSON.parse(userSnapshot);
    } catch {
      return null;
    }
  }, [userSnapshot]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const profile = useMemo(() => {
    const raw = storedUser || {};

    return {
      name: raw.nama_lengkap || raw.nama || raw.name || defaultProfile.name,
      role: raw.role || defaultProfile.role,
      id: raw.id_pengguna || raw.id || raw.uuid || defaultProfile.id,
      phone: raw.no_hp || raw.phone || raw.telepon || defaultProfile.phone,
      email: raw.email || defaultProfile.email,
      address: raw.alamat || raw.address || defaultProfile.address,
      instansi: raw.instansi || raw.lembaga || defaultProfile.instansi,
      unit: raw.regu || raw.unit || defaultProfile.unit
    };
  }, [storedUser, defaultProfile]);

  const detailRows = [
    { label: 'ID Pengguna', value: profile.id },
    { label: 'No. HP', value: profile.phone },
    { label: 'Email', value: profile.email },
    { label: 'Alamat', value: profile.address },
    { label: 'Instansi', value: profile.instansi },
    { label: 'Unit/Regu', value: profile.unit }
  ].filter((item) => item.value);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800">{profile.name}</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${roleClassName}`}>
            {profile.role}
          </p>
        </div>

        <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 ${avatarClassName}`}>
          <span className="text-xs sm:text-sm font-bold" aria-hidden="true">{getInitials(profile.name)}</span>
          <User size={16} className="hidden" />
        </div>

        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-60">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Profil Lengkap</h4>
          <div className="space-y-2">
            {detailRows.map((row) => (
              <div key={row.label} className="text-xs">
                <p className="text-slate-500">{row.label}</p>
                <p className="text-slate-800 font-semibold wrap-break-word">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
