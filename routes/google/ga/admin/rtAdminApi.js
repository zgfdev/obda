import express from 'express';
import Bottleneck from "bottleneck";
import { patchLocalJSON, getLocalJSON, getFirstHalf, getRouter, saveLocalJSON } from '#utils/obfn.js';
import { cfg_aid, cfg_pid } from '#conf/obcfg.js';
import { aasc } from '../clientGA.js';
import rtGA_adminApi_xm from './rtXM.js';

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const routes = [
  { name: 'index', type: 'index', path: '/', title: 'GA AdminAPI', base: '/api/gapi/ga/admin' },
  { name: 'dev', fn: ()=>'dev' },
  { name: 'GA adminApi XM', type: 'use', path: '/xm', fn: rtGA_adminApi_xm },

  { name: 'account_summary_list_get', path: '/account/summary/list', fn: account_summary_list_get },
  { name: 'account_list_get', path: '/account/list', fn: account_list_get },
  { name: 'account_get', path: '/account/get', fn: account_get },
  { name: 'account_update', path: '/account/update', fn: account_update },
  { name: 'property_list_get', path: '/property/list', fn: property_list_get },
  { name: 'dataStream_list_get', path: '/data-stream/list', fn: dataStream_list_get },
  { name: 'dataStream_list_get_batch', path: '/data-stream/all', fn: dataStream_list_get_batch },
  { name: 'listBigQueryLinks', path: '/link/bq/list', fn: link_bq_list, args: '434750039' },

  { name: 'cd_list_get', path: '/cd/list', fn: cd_list_get },
  { name: 'cd_get', fn: cd_get },
  { name: 'cd_create', fn: cd_create },
  { name: 'cd_update', fn: cd_update },
  { name: 'cd_archive', fn: cd_archive },
  { name: 'cd_list_get_batch', fn: cd_list_get_batch },
  { name: 'cd_create_batch', fn: cd_create_batch },
  { name: 'cd_update_batch', fn: cd_update_batch },

  { name: 'listAllBqLinks', path: '/link/bq/all/list', fn: listAllBqLinks },
  { name: 'createAllBqLinks', path: '/link/bq/all/create', fn: createAllBqLinks },
];
const router = express.Router();
export default getRouter(routes);
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// config info
const limiter = new Bottleneck({//每分钟150个请求
  maxConcurrent: 1,  // 每次只允许1个并发请求
  minTime: 400       // 每个请求间隔400毫秒（60,000 ms / 150 = 400ms）
});

const g_env=process.env;
const g_aid=cfg_aid; // account id
const g_pidArr=g_env['xyz_ga_property_ids']?.split(',') || [];
const g_pid=cfg_pid; // property id
const g_cds_createArr= [];
const g_cds_updateArr= [];
const g_keyEventArr= [];

const cgtn_properties=[];
const cgtn_properties_linked=[]
const cgtn_streams={};
const xyz_properties=["260310016","278242794","310114609"];

// const cdArr=[
//     ['evt_param_A','epa','des_epa'],
//     ['evt_param_B','epb','des_epb'],
//     ['evt_param_C','epc','des_epc'],
//     ['evt_param_D','epd','des_epd'],
//     ['evt_param_E','epd','des_epd'],
// ];
// const pptArr=[
//     '376880390',
//     '272595362',
//     '343551771',
//     '395807159',
//     '296796312',
//     '463847664',
//     '402504954',
//     '402674705',
// ]

const configData = {
  ppts:[],
  cds:[]
};
const cdInfoArr=[];
async function getData(type){
  if(configData.ppts.length==0){
    const data=await getLocalJSON(process.env.cgtn_config_file);
    configData.ppts=data.result.ppts;
    configData.cds=data.result.cds;
    return configData[type];
  }else{
    return configData[type];
  }
}

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// functions
async function account_summary_list_get() {
  const [result] = await aasc.listAccountSummaries(); // [[],null,null]
  return result;
}
async function account_list_get() {
  const [result] = await aasc.listAccounts(); // [[],null,null]
  return result;
}
async function account_get(acId,acName){
  // Res.Account https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/accounts#Account
  const [result] = await aasc.getAccount({  // [{},null,null]
    name: acName||`accounts/${acId||g_aid}`,
  });
  return result;
}
async function account_update(acId,acName,acObj){
  // acObj={
  //   displayName:'_GATest',
  //   regionCode:'CN',
  // };
  if(!acObj){
    return "missing input";
  };
  const [result] = await aasc.updateAccount({
    account: {
      name: acName||`accounts/${acId||g_aid}`,
      ...acObj
    },
    updateMask: {
      paths: ["display_name","region_code"],
    },
  });
  return result;
}
async function property_list_get(acId) {
  const [result] = await aasc.listProperties({ // [[],null,null]
    filter: `parent:accounts/${acId||g_aid}`,
  });
  getObjVal(result,'name');
  return result;
}
function getObjVal(arr,propName) {
  const newArr = arr.map(item => propName=='name'?item[propName].slice(11):item[propName]);
  saveLocalJSON('data/temp/property_id_arr.json', newArr);
  return newArr;
}

// async function dataStream_list_get(pid) {
//   const arr = [];
//   const iterable = aasc.listDataStreamsAsync({
//     parent: `properties/${pid||g_pid}`,
//   });
//   for await (const response of iterable) {
//     arr.push(response);
//   }
//   return arr;
// }
async function dataStream_list_get(pid) {
  const [result] = await aasc.listDataStreams({ // [[],null,null]
    parent: `properties/${pid||g_pid}`,
  });
  return result;
}
async function dataStream_list_get_batch(pidArr=g_pidArr) {
  const promises = pidArr.map(async (pid) => {
    const streams = await dataStream_list_get(pid);
    return { pid, streams };
  });
  const results = await Promise.all(promises);
  const obj = {};
  results.forEach(({ pid, streams }) => {
    obj[pid] = streams;
  });
  return obj;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/

async function cd_list_get(pid) {
  const arr = [];
  const iterable = aasc.listCustomDimensionsAsync({
    parent: `properties/${pid || g_pid}`,
  });
  for await (const response of iterable) {
    arr.push(response);
  }
  return arr;
}
async function cd_create(pid, cdObj) {
  // cdObj = {
  //   parameterName: 'epts',
  //   displayName: 'Timestamp',
  //   description: 'timestamp',
  //   scope: 'EVENT', // 'EVENT', 'USER', 'ITEM'
  // };
  const [result] = await aasc.createCustomDimension({
    parent: `properties/${pid || g_pid}`,
    customDimension: cdObj,
  });
  return result;
}
async function cd_get(cdName) {
  // res.customDimension
  // cdName= `properties/${property}/customDimensions/${customDimension}`;
  const [result] = await aasc.getCustomDimension({
    name: cdName,
  });
  return result;
}
async function cd_update(name, des){
  cdObj=cdObj||{
    displayName: 'testing',
    description: 'testing'
  };
  const [result] = await aasc.updateCustomDimension({
    customDimension: {
      name: name,
      description: des,
    },
    updateMask: {
      paths: ["description"]
    },
  });
  return result;
}
async function cd_archive(cdName) {
  return await aasc.archiveCustomDimension({
    name: cdName,
  });
}
async function cd_list_get_batch(pidArr) {
  pidArr=pidArr||g_pidArr;
  const promises = pidArr.map(async (pid) => {
    const cds = await cd_list_get(pid);
    return { pid, cds };
  });
  const results = await Promise.allSettled(promises);
  const obj = {};
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { pid, cds } = result.value;
      obj[pid] = cds;
      patchLocalJSON('cd_list_get_batch_result',{status:'ok',pid:pid,cds:cds})
    } else {
      patchLocalJSON('cd_list_get_batch_result',{status:'err',pid:pid,reason:result.reason})
    }
  });
  return obj;
}
async function cd_create_batch(pidArr,cdArr) {
  cdArr = cdArr||g_cds_createArr;
  pidArr = pidArr||g_property_ids_target;
  const promises = pidArr.flatMap(e_pid=>{
    return cdArr.map((e, i) => {
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
async function cd_update_batch(cdArr) {
  cdArr = cdArr||g_cds_updateArr;
  cdArr.forEach((e) => {
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
async function dataRention_get(pid){
  const [result] = await aasc.getDataRetentionSettings({
    name:  `properties/${pid || g_pid}/dataRetentionSettings`,
  });
  return result;
}
async function dataRention_update(pid){
  const [result] = await aasc.updateDataRetentionSettings({
    dataRetentionSettings: {
      name:  `properties/${pid || g_pid}/dataRetentionSettings`,
      eventDataRetention: "FIFTY_MONTHS",
    },
    updateMask: {
      paths: ["event_data_retention"],
    }
  });
  console.log('oblog_20241018','dataRention_update',response);
  return result;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function signal_get(pid){
  const [result] = await aasc.getGoogleSignalsSettings({
    name:  `properties/${pid || g_pid}/googleSignalsSettings`,
  });
  console.log('oblog_20241018','signal_get',response);
  return result;
}
async function signal_consent_update(pid){
  const [result] = await aasc.updateGoogleSignalsSettings({
    googleSignalsSettings: {
      name:  `properties/${pid || g_pid}/googleSignalsSettings`,
      consent: "GOOGLE_SIGNALS_CONSENT_CONSENTED"
    },
    updateMask: {
      paths: ["consent"],
    }
  });
  console.log('oblog_20241018','signal_update',response);
  return result;
}
async function signal_state_update(pid){
  const [result] = await aasc.updateGoogleSignalsSettings({
    googleSignalsSettings: {
      name:  `properties/${pid || g_pid}/googleSignalsSettings`,
      state: "GOOGLE_SIGNALS_ENABLED",
    },
    updateMask: {
      paths: ["state"],
    }
  });
  console.log('oblog_20241018','signal_update',response);
  return result;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function keyEvent_create(pid,evt_name){
  const [result] = await aasc.createKeyEvent({
    keyEvent: {
      eventName: evt_name,
    },
    parent: `properties/${pid || g_pid}`,
  });
  return result;
}
async function keyEvent_update(pid){
  const [result] = await aasc.updateKeyEvent({
    keyEvent: {
      name:  `properties/${pid || g_pid}/googleSignalsSettings`,
      state: "GOOGLE_SIGNALS_ENABLED",
    },
    updateMask: {
      paths: ["state"],
    }
  });
  console.log('oblog_20241018','signal_update',response);
  return result;
}
async function keyEvent_create_batch(pidArr=g_pidArr,keyEventArr=g_keyEventArr) {
  const promises = [];
  pidArr.forEach((e_pid, e_index) => {
    keyEventArr.forEach((evt_name) => {
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

async function link_bq_list(pid){
  const [result] = await aasc.listBigQueryLinks({
    parent: `properties/${pid || g_pid}`,
  });
  console.log('oblog_20241211','link_bq_list',response);
  return result;
}
async function listAllBqLinks(pid){
  const promises = cgtn_properties.map(async (pid) => {
    const links = await link_bq_list(pid);
    return { pid, links };
  });
  const results = await Promise.all(promises);
  const obj = {};
  results.forEach(({ pid, links }) => {
    obj[pid] = links;
  });
  return obj;
}
async function link_bq_create(pid,obj){
  const [result] = await aasc.createBigQueryLink({
    parent: `properties/${pid || g_pid}`,
    bigqueryLink: obj,
  });
  console.log('oblog_20241211','link_bq_create',response);
  return result;
}
function getBqLinkObj(pid){
  return {
    project: `projects/cgtn-204110`,
    dailyExportEnabled: true,
    includeAdvertisingId: false,
    exportStreams: [
      cgtn_streams[pid]
    ],
    datasetLocation: "US"
  };
}
async function createAllBqLinks(){
  return [];
  const promises = cgtn_properties
  .filter(pid=>!cgtn_properties_linked.includes(pid))
  .map(async (pid) => {
    const links = await link_bq_create(pid,getBqLinkObj(pid));
    return { pid, links };
  });
  const results = await Promise.all(promises);
  const obj = {};
  results.forEach(({ pid, links }) => {
    obj[pid] = links;
  });
  return obj;
}

async function link_bq_patch(obj,mask){
  const [result] = await aasc.updateBigQueryLink({
    bigqueryLink: obj,
    updateMask: mask,
  });
  console.log('oblog_20241211','link_bq_patch',response);
  return result;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/


/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
router.get('/cd/list/batch', async (req, res, next) => {
  const promises = [];
  const pptArr=await getData('ppts');
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: cd_list_get(pptId),
      pptIndex,
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { pptIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`获取第 ${pptIndex + 1} 个 property 的维度情况失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`获取第 ${pptIndex + 1} 个 property 的维度情况成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    patchLocalJSON("cgtn_cdlist_short_",logResults);
    patchLocalJSON("cgtn_cdlist_long_",results);
    res.json(results);
  } catch (error) {
    console.error('batch create error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/cd/create', async (req, res, next) => {
  const cdObj = {
    parameterName: 'epts',
    displayName: 'ob_timestamp',
    description: 'timestamp',
    scope: 'EVENT',
  };
  const result = await cd_create(g_pid, cdObj);
  console.log('oblog_20241018', 'cd_create', result);
  res.json(result);
});
router.get('/cd/create/batch', async (req, res, next) => {
  res.json({results:[]});
  return;
  const promises = [];
  const cdArr=await getData('cds');
  const pptArr=await getData('ppts');
  cdArr.forEach((cdo, cdoIndex) => {
    pptArr.forEach((pptId, pptIndex) => {
      promises.push({
        promise: limiter.schedule(() =>
          cd_create(pptId, {
            parameterName: cdo[1],
            displayName: cdo[0],
            description: cdo[2],
            scope: 'EVENT',
          }),
        ),
        cdoIndex,
        pptIndex,
      });
    });
  });

  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { cdoIndex, pptIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`创建第 ${pptIndex + 1} 个 property 的第 ${cdoIndex + 1} 个维度失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            cIndex: cdoIndex,
            pid: pptArr[pptIndex],
            cdo: cdArr[cdoIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`创建第 ${pptIndex + 1} 个 property 的第 ${cdoIndex + 1} 个维度成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            cIndex: cdoIndex,
            pid: pptArr[pptIndex],
            cdo: cdArr[cdoIndex],
        };
      }
    });
    patchLocalJSON("cgtn_short",logResults);
    patchLocalJSON("cgtn_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch create error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/cd/update', async (req, res, next) => {
  const cdObj = {
    displayName: 'ob_timestamp',
  };
  const result = await cd_update('properties/463376131/customDimensions/9841731339`', '事件动作');
  console.log('oblog_20241018', 'cd_update', result);
  res.json(result);
});
router.get('/cd/update/batch', async (req, res, next) => {
  const promises = [];
  cdInfoArr.forEach((ppto, pptIndex) => {
    const arr=ppto.value;
    arr.forEach((cdo, cdoIndex)=>{
      promises.push({
        promise: limiter.schedule(() =>cd_update(cdo.name, getFirstHalf(cdo.description))),
        pptIndex,
        cdoIndex
      });
    })
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { pptIndex, cdoIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`更新第 ${pptIndex + 1} 个 property 的第 ${cdoIndex} 个 cd 的des情况失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            cdIndex: cdoIndex,
            cdnm: cdInfoArr[pptIndex]['value'][cdoIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`更新第 ${pptIndex + 1} 个 property 的第 ${cdoIndex} 个 cd 的des情况成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            cdIndex: cdoIndex,
            cdnm: cdInfoArr[pptIndex]['value'][cdoIndex],
        };
      }
    });
    patchLocalJSON("cgtn_cd_update_short",logResults);
    patchLocalJSON("cgtn_cd_update_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
router.get('/dr/get', async (req, res, next) => {
  const result = await dataRention_get("463376131");
  console.log('oblog_20241018', 'dr_get', result);
  res.json(result);
});
router.get('/dr/get/batch', async (req, res, next) => {
  const promises = [];
  const pptArr=await getData('ppts');
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: dataRention_get(pptId),
      pptIndex,
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { pptIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`获取第 ${pptIndex + 1} 个 property 的DR情况失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`获取第 ${pptIndex + 1} 个 property 的DR情况成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    patchLocalJSON("cgtn_drlist_short",logResults);
    patchLocalJSON("cgtn_drlist_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch create error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/dr/update', async (req, res, next) => {
  const result = await dataRention_update("443397177");
  console.log('oblog_20241018', 'dr_update', result);
  res.json(result);
});
router.get('/dr/update/batch', async (req, res, next) => {
  const promises = [];
  const pptArr=await getData('ppts');
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
        console.error(`更新第 ${pptIndex + 1} 个 property 的DR情况失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`更新第 ${pptIndex + 1} 个 property 的DR情况成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    patchLocalJSON("cgtn_dr_update_short",logResults);
    patchLocalJSON("cgtn_dr_update_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
router.get('/signal/get', async (req, res, next) => {
  const result = await signal_get("443397177");
  console.log('oblog_20241018', 'signal_get', result);
  res.json(result);
});
router.get('/signal/get/batch', async (req, res, next) => {
  const promises = [];
  const pptArr=await getData('ppts');
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: signal_get(pptId),
      pptIndex,
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    console.log('oblog_20241021','ts',Date.now())
    const logResults = results.map((result, index) => {
      const { pptIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`获取第 ${pptIndex + 1} 个 property 的signal情况失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`获取第第 ${pptIndex + 1} 个 property 的signal情况成功。`,Date.now());
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    patchLocalJSON("cgtn_signal-get_short",logResults);
    patchLocalJSON("cgtn_signal-get_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/signal/update', async (req, res, next) => {
  const result = await signal_consent_update("443397177");
  console.log('oblog_20241018', 'signal_update', result);
  res.json(result);
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
router.get('/keyevt/create', async (req, res, next) => {
  const result = await keyEvent_create("443397177");
  console.log('oblog_20241018', 'keyEvent_create', result);
  res.json(result);
});
router.get('/keyevt/create/batch', async (req, res, next) => {
  const promises = [];
  const pptArr=await getData('ppts');
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: keyEvent_create(pptId),
      pptIndex,
    });
  });
  try {
    const results = await Promise.allSettled(promises.map((p) => p.promise));
    const logResults = results.map((result, index) => {
      const { pptIndex } = promises[index];
      if (result.status === 'rejected') {
        console.error(`创建第 ${pptIndex + 1} 个 property 的keyEvent情况失败：`, result.reason);
        return {
            status: 'error',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`创建第 ${pptIndex + 1} 个 property 的keyEvent情况成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            pid: pptArr[pptIndex],
        };
      }
    });
    patchLocalJSON("cgtn_keyEvent_create_short",logResults);
    patchLocalJSON("cgtn_keyEvent_create_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch create error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/keyevt/update', async (req, res, next) => {
  const result = await signal_consent_update("443397177");
  console.log('oblog_20241018', 'signal_update', result);
  res.json(result);
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
router.get('/link/bq/create', async (req, res, next) => {
  console.log('oblog_20241218','12222212',)
  const obj={
    project: `projects/bqdev-obxyz`,
    dailyExportEnabled: true,
    streamingExportEnabled: true,
    freshDailyExportEnabled: false,
    includeAdvertisingId: true,
    exportStreams: [
      "properties/313424610/dataStreams/3536564034",
    ],
    // excludedEvents: ["scroll"],
    datasetLocation: "US"
  }
  const result = await link_bq_create("313424610", obj);
  console.log('oblog_20241211','link_bq_create', result);
  res.json(result);
});
router.get('/link/bq/patch', async (req, res, next) => {
  const obj={
    "name": "properties/234306380/bigQueryLinks/hruqRa3ESXK5cxEHR0ZlKQ",
    // project: `projects/bqdev-obxyz`,
    freshDailyExportEnabled: false,
    exportStreams: [
      "properties/234306380/dataStreams/1938120469",
      "properties/234306380/dataStreams/9868288293",
    ],
  }
  const mask={
    paths: ["fresh_daily_export_enabled","export_streams"] //must in snake case
  }
  const result = await link_bq_patch(obj,mask);
  console.log('oblog_20241211','link_bq_patch', result);
  res.json(result);
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/


// 确定哪些媒体资源（ID）要进行biquery关联
// 确定要关联到的GCP项目ID
// 确定数据存储位置
// 确定是否每一媒体资源下的所有数据流都要导出
// 确定导出类型（daily、stream、fresh(360)）
// 确定“对于移动应用数据流，将广告标识符纳入到导出范围内”是否开启
// 确定是否有要排除的事件
// 另：api暂不支持用户数据导出类型设置
// 权限：所有要设置关联的媒体资源&GCP项目的编辑权限
// 权限给到服务账号：
