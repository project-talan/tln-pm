import { useState } from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from 'react';

import ErrorFallback from './../../shared/ErrorFallback';
import Progress from './../../shared/Progress';
import Wrapper from './Wrapper';


function Projects() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <Wrapper key={refreshKey} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default Projects;