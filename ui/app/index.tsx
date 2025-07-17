import { render } from 'solid-js/web';

import '@/app/index.css';
/* @refresh reload */
import { App } from '@/app/app';

const root = document.querySelector(`#root`);
render(() => <App />, root!);
