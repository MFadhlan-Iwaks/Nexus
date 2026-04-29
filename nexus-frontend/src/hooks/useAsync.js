// src/hooks/useAsync.js
// ============================================================
// Custom hook untuk menangani async calls dengan konsisten:
// loading, error, data state.
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * @param {Function} asyncFn - Fungsi async yang dipanggil saat mount
 * @param {Array} deps - Dependencies
 * @returns {{ data, loading, error, refetch }}
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err.message || 'Terjadi kesalahan.' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
