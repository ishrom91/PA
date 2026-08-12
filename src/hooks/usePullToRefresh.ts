import { useRef, useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 72 }: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  /** Sync mirror of pullDistance — safe to read in onTouchEnd before re-render */
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);

  const setDistance = useCallback((distance: number) => {
    pullDistanceRef.current = distance;
    setPullDistance(distance);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || refreshingRef.current) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
    setDistance(0);
  }, [setDistance]);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || refreshingRef.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        setDistance(Math.min(delta * 0.45, threshold * 1.4));
      }
    },
    [threshold, setDistance],
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    const distance = pullDistanceRef.current;

    if (distance >= threshold && !refreshingRef.current) {
      refreshingRef.current = true;
      setRefreshing(true);
      setDistance(threshold * 0.6);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          setDistance(0);
        }, 400);
      }
    } else {
      setDistance(0);
    }
  }, [threshold, onRefresh, setDistance]);

  return {
    pullDistance,
    refreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
