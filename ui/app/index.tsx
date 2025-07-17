import { render } from 'solid-js/web';

/* @refresh reload */
import { App } from '@/app/app';

const root = document.querySelector(`#root`);
render(() => <App />, root!);
