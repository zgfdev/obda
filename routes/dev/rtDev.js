import { getLocalData } from '#utils/obdata.js';
import { getRouter } from '#utils/obfn.js';
// import data from '#data/test.json' with { type: 'json' };

const routes=[
  { name: 'index', type: 'index', path: '/', title: 'Dev', base: '/api/dev' },
  { name: 'test', fn: test },
];
export default getRouter(routes);

async function test() {
  return (await getLocalData("test"))[0];
}
async function testPerf(){
  const perf_start=Date.now();
  // for(let i=0;i<10000;i++){
  //   await test()
  // }
  const promises = [];
  for (let i = 0; i < 8187; i++) { //GDIProcessHandleQuota为10000，为何只能打开八千多次？本进程也同时打开了其他很多文件
    promises.push(test());
  }
  const results = await Promise.all(promises);
  
  const perf_end=Date.now();
  console.log('oblog_20241219','perf',perf_end-perf_start)
}
