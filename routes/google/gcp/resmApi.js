import express from 'express';
import { ProjectsClient } from '@google-cloud/resource-manager';
import { patchLocalJSON, getLocalJSON, getRouter } from '#utils/obfn.js';
import { cfg_key } from '#conf/obcfg.js';

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const routes = [
  { name: 'index', type: 'index', path: '/', title: 'gcp resouce manager api', base: '/gapi/gcp/resm' },
  { name: 'getProjectList', path: '/prj/list', fn: project_getList },
];
const router = express.Router();
export default getRouter(routes);
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
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
