'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const asyncFnRef = useRef(asyncFn);
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    asyncFnRef.current = asyncFn;
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFnRef.current();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err.message || 'Terjadi kesalahan.' });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      execute();
    }, 0);

    return () => clearTimeout(timer);
  }, [depsKey, execute]);

  return { ...state, refetch: execute };
}
