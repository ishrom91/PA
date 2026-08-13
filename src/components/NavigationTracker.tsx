import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAnonymousEvent, TrainingEvent } from '../lib/training-events';

/** Records anonymized page views when user opted in to data sharing */
export default function NavigationTracker() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    const shareEnabled = profile?.share_for_training ?? false;
    if (!user || !shareEnabled) return;

    const routeKey = `${location.pathname}${location.search}${location.hash}`;
    if (prevRef.current === routeKey) return;

    recordAnonymousEvent(
      TrainingEvent.PAGE_VIEW,
      {
        path: location.pathname,
        ...(location.search ? { search: location.search } : {}),
        ...(location.hash ? { hash: location.hash } : {}),
        ...(prevRef.current ? { from: prevRef.current } : {}),
      },
      true,
    );

    prevRef.current = routeKey;
  }, [location.pathname, location.search, location.hash, user, profile?.share_for_training]);

  return null;
}
