import { Route, Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import { Toaster } from 'solid-sonner';

import NotFoundPage from '@/pages/404';
import TournamentsPage from '@/pages/tournaments';

const Stats = lazy(() => import(`@/pages/stats`));
const Matches = lazy(() => import(`@/pages/matches`));
const Lander = lazy(() => import(`@/pages/lander`));
const DiscordPage = lazy(() => import(`@/pages/discord`));
const PassPage = lazy(() => import(`@/pages/pass`));
const TournamentDetail = lazy(() => import(`@/pages/tournament-stats`));

export const App = () => (
  <>
    <Router>
      <Route component={Stats} path='/matches/:id' />
      <Route component={Matches} path='/matches' />
      <Route component={DiscordPage} path='/discord' />
      <Route component={PassPage} path='/pass' />
      <Route component={NotFoundPage} path='*404' />
      <Route component={Lander} path='/' />
      <Route component={TournamentsPage} path='/tournaments' />
      <Route component={TournamentDetail} path='/tournaments/:id' />
    </Router>
    <Toaster />
  </>
);
