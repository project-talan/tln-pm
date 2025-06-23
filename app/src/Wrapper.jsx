import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';

import ErrorFallback from './shared/ErrorFallback';
import Progress from './shared/Progress';
import './index.css'
import {App, resetApp } from './App.jsx'

function Wrapper() {
  const [refreshKey, setRefreshKey] = useState(0);
  //console.log('!Wrapper');
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { resetApp(); setRefreshKey((prev) => prev + 1)}}>
      <Suspense fallback={<Progress />}>
        <App key={refreshKey}/>
      </Suspense>
    </ErrorBoundary>
  )
}

export default Wrapper;
