import { qwikCity } from '@builder.io/qwik-city/middleware/bun';
import routes from './src/routes';

export default qwikCity({ routes, static: { root: 'public' } });
