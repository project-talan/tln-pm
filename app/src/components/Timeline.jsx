import { useState, Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from './../shared/ErrorFallback';
import Progress from './../shared/Progress';
import Wbs from './Wbs';

function Timeline() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <Wbs key={refreshKey} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default Timeline;