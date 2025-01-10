import express from 'express';
import Bottleneck from 'bottleneck';
import { readFile } from 'node:fs/promises';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';

// set config info based on actual needs
const g_env = process.env;
const g_property_ids_target = g_env['xm_ga_property_ids_target']?.split(',') || ['xxxxxxxxx', 'xxxxxxxxx'];
const g_pid_ref = g_env["xm_ga_property_id_ref"] || 'xxxxxxxxx';
const g_pid = g_property_ids_target[2];
const g_key_events = g_env['xm_ga_key_events']?.split(',') || ['add_to_cart', 'add_to_wishlist'];
const g_retention = ['FIFTY_MONTHS', 'FOURTEEN_MONTHS'][0];
const g_cds_path = g_env["xm_ga_custom_dimensions_ref_file"] || 'cds_xxx.json';
const g_keyFile_path = g_env["xm_gcp_service_account_auth_file"] || 'auth_file_xxx.json';

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
  { name: 'account_list', fn: account_list },
  { name: 'cd_list_get', fn: cd_list_get },
  // { name: 'cd_get', fn: cd_get },
  // { name: 'cd_create', fn: cd_create },
  // { name: 'cd_update', fn: cd_update },
  // { name: 'cd_archive', fn: cd_archive },
  { name: 'cd_create_batch', fn: cd_create_batch },
  // { name: 'cd_update_batch', fn: cd_update_batch },
  { name: 'keyEvt_create_batch', fn: keyEvt_create_batch },
  { name: 'dataRention_update', fn: dataRention_update },
  { name: 'dataRention_update_batch', fn: dataRention_update_batch },
];
routes.forEach((route) => {
  const rtType = route.type || 'get';
  const rtPath = route.path || '/' + route.name.replace(/_/g, '/');
  if (rtType == 'use') {
    router.use(rtPath, route.fn);
  } else if (rtType == 'index') {
    router.get('/', (req, res, next) => {
      res.render('route', { title: route.title, rtBase: route.base, routes: routes });
      // res.json({ title: route.title, rtBase: route.base, routes: routes });
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
// account
async function account_list() {
  return aasc.listAccounts();
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// custom dimensions
async function cd_list_get(pid) {
  return await aasc.listCustomDimensions({
    parent: `properties/${pid || g_pid}`,
  });
}
async function cd_get(cdName) {
  // cdName= `properties/${property}/customDimensions/${customDimension}`;
  return await aasc.getCustomDimension({
    name: cdName,
  });
}
async function cd_create(pid, cdObj) {
  // cdObj = {
  //   parameterName: 'epts',
  //   displayName: 'Timestamp',
  //   description: 'timestamp',
  //   scope: 'EVENT', // 'EVENT', 'USER', 'ITEM'
  // };
  return await aasc.createCustomDimension({
    parent: `properties/${pid || g_pid}`,
    customDimension: cdObj,
  });
}
async function cd_update(cdName, cdObj) {
  return await aasc.updateCustomDimension({
    customDimension: {
      name: cdName,
      ...cdObj,
    },
    updateMask: {
      paths: ['display_name','description'],
    },
  });
}
async function cd_archive(cdName) {
  return await aasc.archiveCustomDimension({
    name: cdName,
  });
}
async function cd_create_batch() {
  const data = await getLocalJSON(g_cds_path);
  const arr = data.result;
  const pidArr = g_property_ids_target;
  const promises = pidArr.flatMap(e_pid=>{
    return arr.map((e, i) => {
      return limiter.schedule(async () => {
        try {
          const streams = await aasc.createCustomDimension({
            parent: `properties/${e_pid || g_pid}`,
            customDimension: {
              displayName: e.displayName,
              description: e.description,
              scope: e.scope,
              parameterName: e.parameterName,
            },
          });
          return { status: 'fulfilled', result: streams };
        } catch (error) {
          return { status: 'rejected', result: error.details };
        }
      });
    });
  });
  const results = await Promise.allSettled(promises);
  return results;
}
async function cd_update_batch() {
  const data = await getLocalJSON(g_cds_path);
  const arr = data.result;
  arr.forEach((e) => {
    aasc.updateCustomDimension({
      customDimension: {
        name: e.name,
        displayName: e.displayName,
        description: e.description,
      },
      updateMask: {
        paths: ['display_name', 'description'],
      },
    });
  });
  return [];
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// key events
async function keyEvt_create(pid, evt_name) {
  const response = await aasc.createKeyEvent({
    parent: `properties/${pid || g_pid}`,
    keyEvent: {
      eventName: evt_name,
    },
  });
  return response;
}
async function keyEvt_create_batch() {
  const promises = [];
  const pidArr = g_property_ids_target;
  pidArr.forEach((e_pid, e_index) => {
    g_key_events.forEach((evt_name) => {
      promises.push({
        promise: keyEvt_create(e_pid, evt_name),
        index: e_index,
        evt: evt_name,
      });
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { index:pIndex } = promises[index];
      const evt = promises[index]['evt'];
      if (result.status === 'rejected') {
        console.error(`The creation of the ${pIndex + 1}th property's keyEvent ${evt} failed:`, result.reason);
        return {
          status: 'error',
          pIndex: pIndex,
          pid: pidArr[pIndex],
          reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`The creation of the ${pIndex + 1}th property's keyEvent ${evt} was successful.`);
        return {
          status: 'success',
          pIndex: pIndex,
          pid: pidArr[pIndex],
        };
      }
    });
    return results;
  } catch (error) {
    console.error('batch create error:', error);
    return ['err'];
  }
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// data retention
async function dataRention_update(pid, rentention) {
  const response = await aasc.updateDataRetentionSettings({
    dataRetentionSettings: {
      name: `properties/${pid || g_pid}/dataRetentionSettings`,
      eventDataRetention: rentention || g_retention,
    },
    updateMask: {
      paths: ['event_data_retention'],
    },
  });
  return response;
}
async function dataRention_update_batch(pidArr) {
  const promises = [];
  pidArr = pidArr||g_property_ids_target;
  pidArr.forEach((e_pid, e_index) => {
    promises.push({
      promise: dataRention_update(e_pid),
      index: e_index,
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { index:pIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`The update of the ${pIndex + 1}th property's DR status failed:`, result.reason);
        return {
          status: 'error',
          pIndex: pIndex,
          pid: pidArr[pIndex],
          reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`The update of the ${pIndex + 1}th property's DR status was successful.`);
        return {
          status: 'success',
          pIndex: pIndex,
          pid: pidArr[pIndex],
        };
      }
    });
    return results;
  } catch (error) {
    console.error('batch update error:', error);
    return ['err'];
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
