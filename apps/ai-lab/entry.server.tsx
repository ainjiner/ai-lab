import { renderToString } from '@builder.io/qwik/server';
import { Root } from './root';

export default {
  fetch(request: Request) {
    return renderToString(<Root />);
  },
};
