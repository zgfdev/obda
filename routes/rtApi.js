import rtAuth from './auth/rtAuth.js'
import rtDev from './dev/rtDev.js';
import rtKit from './kit/rtKit.js';
import rtLog from './log/rtLog.js';
import rtGA_dataApi from './google/ga/data/rtDataApi.js';
import rtGA_adminApi from './google/ga/admin/rtAdminApi.js';
import rtGCP_resmApi from './google/gcp/resmApi.js';
import { getRouter } from '#utils/obfn.js';


const routes=[
  { name: 'index', type: 'index', path: '/', title: 'API Index', base: '/api' },
  { name: 'auth', type: 'use', path: '/auth', fn: rtAuth },
  { name: 'dev', type: 'use', path: '/dev', fn: rtDev },
  { name: 'kit', type: 'use', path: '/kit', fn: rtKit },
  { name: 'log', type: 'use', path: '/log', fn: rtLog },
  { name: 'GA dataApi', type: 'use', path: '/gapi/ga/data', fn: rtGA_dataApi },
  { name: 'GA adminApi', type: 'use', path: '/gapi/ga/admin', fn: rtGA_adminApi },
  { name: 'GCP resmApi', type: 'use', path: '/gapi/gcp/resm', fn: rtGCP_resmApi },
];
export default getRouter(routes);

