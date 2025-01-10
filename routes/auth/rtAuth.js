import { getRouter } from '#utils/obfn.js';

const routes = [
  { name: 'index', type: 'index', path: '/', title: 'Auth', base: '/api/auth' },
  { name: 'dev', fn: () => 'dev' },
  { name: 'login', fn: () => 'login' },
];
export default getRouter(routes);

async function login() {
  const rb = req.body;
  if (rb.username == 'aten' && rb.password == 'aten#123') {
    return {
      status: 'success',
      msg: 'login success',
    };
  } else {
    return {
      status: 'failed',
      msg: 'login failed',
    };
  }
}
