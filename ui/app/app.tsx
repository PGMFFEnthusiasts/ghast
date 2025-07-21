import { Route, Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import { Toaster } from 'solid-sonner';

import NotFoundPage from '@/pages/404';

const Stats = lazy(() => import(`@/pages/stats`));
const Matches = lazy(() => import(`@/pages/matches`));
const Lander = lazy(() => import(`@/pages/lander`));
const DiscordPage = lazy(() => import('@/pages/discord'));

export const App = () => (
  <>
    <Router>
      <Route component={Stats} path='/matches/:id' />
      <Route component={Matches} path='/matches' />
      <Route component={DiscordPage} path='/discord' />
      <Route component={NotFoundPage} path='*404' />
      <Route component={Lander} path='/' />
    </Router>
    <Toaster />
  </>
);
