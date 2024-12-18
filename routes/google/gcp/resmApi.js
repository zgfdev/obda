import express from 'express';
import { ProjectsClient } from '@google-cloud/resource-manager';
import { saveJSON, getLocalJSON } from '../../../src/utils/obfn.js';
import { cfg_key } from '../../../src/obcfg.js';


const rmc = new ProjectsClient({ keyFilename: cfg_key });

async function project_getList() {
  const projects = rmc.searchProjectsAsync();
  console.log('prj');
  for await (const project of projects) {
    console.info(project);
  }
  return projects;
}


/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router = express.Router();
export default router;

const apiInfo = {
  base: '/gapi/gcp/resm',
  list: [
    {
      name: 'getProjectList',
      meth: 'get',
      path: '/prj/list',
      fn: project_getList
    }
  ],
};
router.get('/', (req, res, next) => {
  res.render('apiList', { title: `gcp resouce manager api`, apiInfo: apiInfo });
});
apiInfo.list.forEach((api) => {
  router[api.meth](api.path, async (req, res, next) => {
    const result = await api.fn();
    // console.log('oblog', `api.result.${api.name}`, result);
    res.json({ result: result });
  });
});

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/


