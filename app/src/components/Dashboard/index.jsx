import { useState, Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from './../../shared/ErrorFallback';
import Progress from './../../shared/Progress';
import { Projects, resetProjects } from './Projects';

function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { resetProjects(); setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <Projects key={refreshKey} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default Dashboard;