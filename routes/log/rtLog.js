import { getLocalData } from '#utils/obdata.js';
import { getRouter } from '#utils/obfn.js';
import rtLog_dl from './dataLayer.js'

const routes=[
  { name: 'index', type: 'index', path: '/', title: 'log', base: '/api/log' },
  { name: 'dataLayer', type: 'use', fn: rtLog_dl },
];
export default getRouter(routes);