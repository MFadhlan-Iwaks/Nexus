"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function CenterAlertProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (text = '') => {
      setMessage(String(text));
      setIsOpen(true);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-120 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Pemberitahuan</h3>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{message}</p>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
