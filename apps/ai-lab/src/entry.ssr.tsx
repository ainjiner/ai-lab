import { renderToString, type RenderOptions } from '@builder.io/qwik/server';
import { App } from './app';

export default function render(opts: RenderOptions) {
  return renderToString(<App />, {
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}
