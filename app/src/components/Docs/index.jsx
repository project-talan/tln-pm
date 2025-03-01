import { useState, Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from './../../shared/ErrorFallback';
import Progress from './../../shared/Progress';
import { Topics, resetDocs } from './Topics';

function Srs() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { resetDocs(); setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <Topics key={refreshKey} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default Srs;