import { renderToString, type RenderOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import { App } from './app';

export default function render(opts: RenderOptions) {
  return renderToString(<App />, {
    manifest,
    ...opts,
    containerAttributes: {
      lang: 'en',
      ...opts.containerAttributes,
    },
  });
}
