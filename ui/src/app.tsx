import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { Toaster } from 'solid-sonner';

import '@/styles/main.css';

const App = () => (
  <Router
    root={(props) => (
      <>
        <Suspense>{props.children}</Suspense>
        <Toaster />
      </>
    )}
  >
    <FileRoutes />
  </Router>
);

export default App;
