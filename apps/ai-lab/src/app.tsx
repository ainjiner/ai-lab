import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, useDocumentHead, useLocation } from '@builder.io/qwik-city';
import './global.css';

export const App = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{head.title || 'AI Lab'}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {head.meta.map((m) => <meta key={m.key} {...m} />)}
        {head.links.map((l) => <link key={l.key} {...l} />)}
        {head.styles.map((s) => (
          <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
        ))}
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
