import { useState, Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from './../shared/ErrorFallback';
import Progress from './../shared/Progress';
import { SrsContainer, resetSrs } from './SrsContainer';

function Srs() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { resetSrs(); setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <SrsContainer key={refreshKey} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default Srs;