import { render } from '@builder.io/qwik';
import { App } from './app';

export default render(document.getElementById('app') as HTMLElement, <App />);
