/* GA Admin API Reference
https://developers.google.com/analytics/devguides/config/admin/v1
https://developers.google.com/analytics/devguides/reporting/data/v1/rest
https://googleapis.dev/nodejs/analytics-admin/latest/index.html
*/

import express from 'express';
import Bottleneck from 'bottleneck';
import { readFile } from 'node:fs/promises';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';

const g_properties=["468161693","468144138","464875234","468217899","468158461","468171503"] // adjust as needed
const g_pid = g_properties[0]; // adjust as needed
const g_cds_path='cds_xxx.json'; // replace it
const g_key_events=["add_to_cart","add_to_wishlist","begin_checkout","session_start","view_item","view_item_list","view_search_results"]; // adjust as needed
const g_retention="FOURTEEN_MONTHS"; // adjust as needed
const g_keyFile_path="auth_xxx.json"; // replace it

const aasc = new AnalyticsAdminServiceClient({ keyFilename: g_keyFile_path });
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 400,
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router = express.Router();
export default router;

const routes = [
  { name: 'index', type: 'index', path: '/', title: 'GA AdminAPI: XM', base: '/api/gapi/ga/admin/xm' },
  { name: 'dev', fn: () => 'dev' },
  { name: 'cd_list_get', fn: cd_list_get },
  // { name: 'cd_get', fn: cd_get },
  // { name: 'cd_create', fn: cd_create },
  // { name: 'cd_update', fn: cd_update },
  // { name: 'cd_archive', fn: cd_archive },
  { name: 'cd_create_batch', fn: cd_create_batch },
  // { name: 'cd_update_batch', fn: cd_update_batch },
  { name: 'keyEvt_create_batch', fn: keyEvt_create_batch },
  { name: 'dataRention_update_batch', fn: dataRention_update_batch }
];
routes.forEach((route) => {
  const rtType = route.type || 'get';
  const rtPath = route.path || '/' + route.name.replace(/_/g, '/');
  if (rtType == 'use') {
    router.use(rtPath, route.fn);
  } else if (rtType == 'index') {
    router.get('/', (req, res, next) => {
      // res.render('route', { title: route.title, rtBase: route.base, routes: routes });
      res.json({ title: route.title, rtBase: route.base, routes: routes });
    });
  } else {
    router[rtType](rtPath, async (req, res, next) => {
      try {
        const result = await route.fn();
        res.json({ status: 'ok', result: result });
      } catch (error) {
        res.json({ status: 'err', result: error.details });
      }
    });
  }
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function cd_list_get(pid) {
  return await aasc.listCustomDimensions({
    parent: `properties/${pid || g_pid}`,
  });
}
async function cd_get(pid) {
  return await aasc.getCustomDimension({
    name: `properties/${pid || g_pid}`,
  });
}
async function cd_create(pid, cdObj) {
  return await aasc.createCustomDimension({
    parent: `properties/${pid || g_pid}`,
    customDimension: cdObj,
  });
}
async function cd_update(name, des) {
  return await aasc.updateCustomDimension({
    customDimension: {
      name: name,
      description: des,
    },
    updateMask: {
      paths: ['description'],
    },
  });
}
async function cd_archive(name, des) {
  return await aasc.archiveCustomDimension({
    name: `properties/${pid || g_pid}`,
  });
}
async function cd_create_batch(pid) {
  const data = await getLocalJSON(g_cds_path);
  const arr = data.result;
  const promises = arr.map((e, i) => {
    limiter.schedule(async() => {
      try {
        const streams = await aasc.createCustomDimension({
          parent: `properties/${pid || g_pid}`,
          customDimension: {
            displayName: e.displayName,
            description: e.description,
            scope: e.scope,
            parameterName: e.parameterName,
          },
        });
        // return { result: streams };
      } catch (error) {
        console.log({ result: error.details });
      }
    });
  });
  const results = await Promise.all(promises);
  return results;
}
async function cd_update_batch() {
  const data = await getLocalJSON(g_cds_path);
  const arr = data.result;
  arr.forEach((e) => {
    aasc.updateCustomDimension({
      customDimension: {
        displayName: e.displayName,
        description: e.description,
        scope: e.scope,
        parameterName: e.parameterName,
      },
      updateMask: {
        paths: ['displayName', 'description', 'scope', 'parameterName'],
      },
    });
  });
  return [];
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function keyEvt_create(pid,evt_name){
  const response = await aasc.createKeyEvent({
    keyEvent: {
      eventName: evt_name,
    },
    parent: `properties/${pid || g_pid}`,
  });
  return response;
}
async function keyEvt_create_batch(){
  const promises = [];
  const pptArr=g_properties;
  pptArr.forEach((pptId, pptIndex) => {
    g_key_events.forEach(evt_name=>{
      promises.push({
        promise: keyEvt_create(pptId,evt_name),
        pptIndex,
        evt: evt_name
      });
    })
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { pptIndex } = promises[index];
      const evt=promises[index]['evt']
      if (result.status === 'rejected') {
        console.error(`The creation of the ${pptIndex + 1}th property's keyEvent ${evt} failed:`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`The creation of the ${pptIndex + 1}th property's keyEvent ${evt} was successful.`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    return results;
  } catch (error) {
    console.error('batch create error:', error);
    return ['err']
  }
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function dataRention_update(pid, rentention){
  const response = await aasc.updateDataRetentionSettings({
    dataRetentionSettings: {
      name:  `properties/${pid || g_pid}/dataRetentionSettings`,
      eventDataRetention: rentention||g_retention,
    },
    updateMask: {
      paths: ["event_data_retention"],
    }
  });
  return response;
}
async function dataRention_update_batch(){
  const promises = [];
  const pptArr=g_properties;
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: dataRention_update(pptId),
      pptIndex,
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { pptIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`The update of the ${pptIndex + 1}th property's DR status failed:`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`The update of the ${pptIndex + 1}th property's DR status was successful.`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    return results;
  } catch (error) {
    console.error('batch update error:', error);
    return ['err']
  }
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function getLocalJSON(path) {
  try {
    const str = await readFile(path, { encoding: 'utf8' });
    return { desc: 'getLocalJSON', status: 'ok', result: JSON.parse(str) };
  } catch (err) {
    console.log('getLocalJSON.err', err.message);
    return { desc: 'getLocalJSON', status: 'err', msg: err.message.split(',')[0] }; //ENOENT: Error NO ENTry
  }
}