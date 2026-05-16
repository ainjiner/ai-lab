import { render } from '@builder.io/qwik';
import { Root } from './root';

export default render(document.getElementById('root') as HTMLElement, <Root />);
