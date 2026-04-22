"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationBell({
  items = [],
  className = '',
  panelClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(
    items.map((item, index) => ({
      id: item.id || `notif-${index + 1}`,
      title: item.title,
      message: item.message,
      time: item.time,
      read: Boolean(item.read)
    }))
  );
  const wrapperRef = useRef(null);

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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 px-1 bg-red-500 text-white text-[9px] leading-3.5 text-center rounded-full border border-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-60 overflow-hidden ${panelClassName}`}>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Notifikasi</h4>
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <CheckCheck size={14} /> Tandai Semua
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">
                Tidak ada notifikasi.
              </div>
            )}

            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markAsRead(item.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 transition-colors ${item.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                  </div>
                  {!item.read && (
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{item.time}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}