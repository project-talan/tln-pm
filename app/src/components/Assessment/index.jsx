import { useState, Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from './../../shared/ErrorFallback';
import Progress from './../../shared/Progress';

import { HUD, resetHUD } from "./HUD";

export default function Assessment() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { resetHUD(); setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <HUD key={refreshKey} />
      </Suspense>
    </ErrorBoundary>
  );
}
