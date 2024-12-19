import express from 'express';
import Bottleneck from "bottleneck";
import { saveJSON, getLocalJSON, getFirstHalf } from '../../../src/utils/obfn.js';
import { cfg_aid, cfg_pid } from '../../../src/obcfg.js';
import { aasc } from './clientGA.js';

console.log('oblog_20241217','cur_ids:',cfg_aid,cfg_pid)


const limiter = new Bottleneck({//每分钟150个请求
  maxConcurrent: 1,  // 每次只允许1个并发请求
  minTime: 400       // 每个请求间隔400毫秒（60,000 ms / 150 = 400ms）
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
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
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function account_list_get() {
  const [accounts] = await aasc.listAccounts();
  // accounts.forEach((account) => {
  //   console.log(account);
  // });
  return accounts;
}
async function property_list_get() {
  return await aasc.listProperties({
    // filter: `parent:properties/${cfg_pid}`,
    filter: `parent:accounts/${cfg_aid}`,
  });
}
// async function data_stream_list_get(pid) {
//   const arr = [];
//   const iterable = aasc.listDataStreamsAsync({
//     parent: `properties/${pid||cfg_pid}`,
//   });
//   for await (const response of iterable) {
//     arr.push(response);
//   }
//   return arr;
// }
async function data_stream_list_get(pid) {
  return await aasc.listDataStreams({
    parent: `properties/${pid||cfg_pid}`,
  });
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const customDimensionObj = {
  name: 'string',
  parameterName: 'string',
  displayName: 'string',
  description: 'string',
  scope: 'string',
  disallowAdsPersonalization: true,
};
async function cd_list_get(pid) {
  const arr = [];
  const iterable = aasc.listCustomDimensionsAsync({
    parent: `properties/${pid || cfg_pid}`,
  });
  for await (const response of iterable) {
    arr.push(response);
  }
  return arr;
}
async function cd_create(pid, cdObj) {
  try {
    const response = await aasc.createCustomDimension({
      parent: `properties/${pid || cfg_pid}`,
      customDimension: cdObj,
    });
    return { status: 'ok', data: response };
  } catch (error) {
    // console.log('oblog_20241018','error',error)
    return { status: 'err', data: error.details };
  }
}
async function cd_update(name, des){
  try {
    const response = await aasc.updateCustomDimension({
      customDimension: {
        name: name,
        description: des,
      },
      updateMask: {
        paths: ["description"]
      },
    });
    return { status: 'ok', data: response };
  } catch (error) {
    console.log('oblog_20241018','error',error)
  }
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function dataRention_get(pid){
  const response = await aasc.getDataRetentionSettings({
    name:  `properties/${pid || cfg_pid}/dataRetentionSettings`,
  });
  console.log('oblog_20241018','dataRention_get',response);
  return response;
}
async function dataRention_update(pid){
  const response = await aasc.updateDataRetentionSettings({
    dataRetentionSettings: {
      name:  `properties/${pid || cfg_pid}/dataRetentionSettings`,
      eventDataRetention: "FIFTY_MONTHS",
    },
    updateMask: {
      paths: ["event_data_retention"],
    }
  });
  console.log('oblog_20241018','dataRention_update',response);
  return response;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function signal_get(pid){
  const response = await aasc.getGoogleSignalsSettings({
    name:  `properties/${pid || cfg_pid}/googleSignalsSettings`,
  });
  console.log('oblog_20241018','signal_get',response);
  return response;
}
async function signal_consent_update(pid){
  const response = await aasc.updateGoogleSignalsSettings({
    googleSignalsSettings: {
      name:  `properties/${pid || cfg_pid}/googleSignalsSettings`,
      consent: "GOOGLE_SIGNALS_CONSENT_CONSENTED"
    },
    updateMask: {
      paths: ["consent"],
    }
  });
  console.log('oblog_20241018','signal_update',response);
  return response;
}
async function signal_state_update(pid){
  const response = await aasc.updateGoogleSignalsSettings({
    googleSignalsSettings: {
      name:  `properties/${pid || cfg_pid}/googleSignalsSettings`,
      state: "GOOGLE_SIGNALS_ENABLED",
    },
    updateMask: {
      paths: ["state"],
    }
  });
  console.log('oblog_20241018','signal_update',response);
  return response;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function key_event_create(pid){
  const response = await aasc.createKeyEvent({
    keyEvent: {
      eventName:  "News_Click",
    },
    parent: `properties/${pid || cfg_pid}`,
  });
  console.log('oblog_20241018','key_event_create',response);
  return response;
}
async function key_event_update(pid){
  const response = await aasc.updateKeyEvent({
    keyEvent: {
      name:  `properties/${pid || cfg_pid}/googleSignalsSettings`,
      state: "GOOGLE_SIGNALS_ENABLED",
    },
    updateMask: {
      paths: ["state"],
    }
  });
  console.log('oblog_20241018','signal_update',response);
  return response;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const cgtn_properties=["443473690","443468995","443468997","443467290","443467224","443468395","443471623","443471853","443469235","443469579","443465474","443466916","443472104","443466570","430626303","443472093","443434892","443451650","443473054","443427902","443442424","443476825","443466319","443428679","443471615","443470805","443468989","443397177","443411514","443471522","443466904","443476644","443472745","443468040","443473298","443465969","443473063","443466332","435805351","435744733","435726861","434750039","454745902","454490720","454752880","454742257","454741352","454726097","454760239","454725710","454755985","454736813","454771654","454722764","454744972","454761323","454729825","454756259","454753449","454727500","454743342","454722665","454750751","454722666","454740530","454747310","454734988","454742269","454733473","454771667"];
const cgtn_properties_linked=["430626303","434750039","435726861","435744733","435805351"]
const cgtn_streams={
  "430626303": "properties/430626303/dataStreams/8203056425",
  "434750039": "properties/434750039/dataStreams/7800548531",
  "435726861": "properties/435726861/dataStreams/7828301779",
  "435744733": "properties/435744733/dataStreams/7828269993",
  "435805351": "properties/435805351/dataStreams/7828345231",
  "443397177": "properties/443397177/dataStreams/8203220095",
  "443411514": "properties/443411514/dataStreams/8203286743",
  "443427902": "properties/443427902/dataStreams/8203164447",
  "443428679": "properties/443428679/dataStreams/8203235324",
  "443434892": "properties/443434892/dataStreams/8203118787",
  "443442424": "properties/443442424/dataStreams/8203254966",
  "443451650": "properties/443451650/dataStreams/8203202001",
  "443465474": "properties/443465474/dataStreams/8203389333",
  "443465969": "properties/443465969/dataStreams/8203304530",
  "443466319": "properties/443466319/dataStreams/8203257441",
  "443466332": "properties/443466332/dataStreams/8203338840",
  "443466570": "properties/443466570/dataStreams/8203400688",
  "443466904": "properties/443466904/dataStreams/8203296745",
  "443466916": "properties/443466916/dataStreams/8203372846",
  "443467224": "properties/443467224/dataStreams/8203342789",
  "443467290": "properties/443467290/dataStreams/8203309912",
  "443468040": "properties/443468040/dataStreams/8203300859",
  "443468395": "properties/443468395/dataStreams/8203348740",
  "443468989": "properties/443468989/dataStreams/8203268606",
  "443468995": "properties/443468995/dataStreams/8203322562",
  "443468997": "properties/443468997/dataStreams/8203338557",
  "443469235": "properties/443469235/dataStreams/8203327592",
  "443469579": "properties/443469579/dataStreams/8203381263",
  "443470805": "properties/443470805/dataStreams/8203263717",
  "443471522": "properties/443471522/dataStreams/8203247710",
  "443471615": "properties/443471615/dataStreams/8203252722",
  "443471623": "properties/443471623/dataStreams/8203339006",
  "443471853": "properties/443471853/dataStreams/8203351538",
  "443472093": "properties/443472093/dataStreams/8203191166",
  "443472104": "properties/443472104/dataStreams/8203394991",
  "443472745": "properties/443472745/dataStreams/8203283188",
  "443473054": "properties/443473054/dataStreams/8203187433",
  "443473063": "properties/443473063/dataStreams/8203310616",
  "443473298": "properties/443473298/dataStreams/8203287828",
  "443473690": "properties/443473690/dataStreams/8203283681",
  "443476644": "properties/443476644/dataStreams/8203272857",
  "443476825": "properties/443476825/dataStreams/8203229281",
  "454490720": "properties/454490720/dataStreams/8574099381",
  "454722665": "properties/454722665/dataStreams/8577386293",
  "454722666": "properties/454722666/dataStreams/8577338313",
  "454722764": "properties/454722764/dataStreams/8577282486",
  "454725710": "properties/454725710/dataStreams/8577222605",
  "454726097": "properties/454726097/dataStreams/8577257191",
  "454727500": "properties/454727500/dataStreams/8577354546",
  "454729825": "properties/454729825/dataStreams/8577324350",
  "454733473": "properties/454733473/dataStreams/8577418185",
  "454734988": "properties/454734988/dataStreams/8577336944",
  "454736813": "properties/454736813/dataStreams/8577306031",
  "454740530": "properties/454740530/dataStreams/8577411973",
  "454741352": "properties/454741352/dataStreams/8577261523",
  "454742257": "properties/454742257/dataStreams/8577238173",
  "454742269": "properties/454742269/dataStreams/8577385369",
  "454743342": "properties/454743342/dataStreams/8577306548",
  "454744972": "properties/454744972/dataStreams/8577313948",
  "454745902": "properties/454745902/dataStreams/8577200554",
  "454747310": "properties/454747310/dataStreams/8577401846",
  "454750751": "properties/454750751/dataStreams/8577393606",
  "454752880": "properties/454752880/dataStreams/8577231260",
  "454753449": "properties/454753449/dataStreams/8577336232",
  "454755985": "properties/454755985/dataStreams/8577283868",
  "454756259": "properties/454756259/dataStreams/8577247665",
  "454760239": "properties/454760239/dataStreams/8577246372",
  "454761323": "properties/454761323/dataStreams/8577297091",
  "454771654": "properties/454771654/dataStreams/8577315376",
  "454771667": "properties/454771667/dataStreams/8577433652"
}
const xyz_properties=["260310016","278242794","310114609"];


async function listAllStreams() {
  const promises = cgtn_properties.map(async (pid) => {
    const streams = await data_stream_list_get(pid);
    return { pid, streams };
  });
  const results = await Promise.all(promises);
  const obj = {};
  results.forEach(({ pid, streams }) => {
    obj[pid] = streams;
  });
  return obj;
}
async function link_bq_list(pid){
  const response = await aasc.listBigQueryLinks({
    parent: `properties/${pid || cfg_pid}`,
  });
  console.log('oblog_20241211','link_bq_list',response);
  return response;
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
  const response = await aasc.createBigQueryLink({
    parent: `properties/${pid || cfg_pid}`,
    bigqueryLink: obj,
  });
  console.log('oblog_20241211','link_bq_create',response);
  return response;
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
  const response = await aasc.updateBigQueryLink({
    bigqueryLink: obj,
    updateMask: mask,
  });
  console.log('oblog_20241211','link_bq_patch',response);
  return response;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const apiInfo={
  base: '/gapi/ga/admin',
  list: [
    {
      name: 'sub:stream',
      meth: 'get',
      path: "/stream",
    },
    {
      name: 'listAccounts',
      meth: 'get',
      path: "/account/list",
      fn: account_list_get,
    },
    {
      name: 'listProperties',
      meth: 'get',
      path: "/property/list",
      fn: property_list_get,
    },
    {
      name: 'listDataStreams',
      meth: 'get',
      path: "/data-stream/list",
      fn: data_stream_list_get,
    },
    {
      name: 'listCustomDimensions',
      meth: 'get',
      path: "/cd/list",
      fn: cd_list_get,
    },
    {
      name: 'listDataStreamsAll',
      meth: 'get',
      path: "/data-stream/all",
      fn: listAllStreams,
    },
    {
      name: 'listBigQueryLinks',
      meth: 'get',
      path: "/link/bq/list",
      fn: link_bq_list,
      args: "434750039"
    },
    {
      name: 'listAllBqLinks',
      meth: 'get',
      path: "/link/bq/all/list",
      fn: listAllBqLinks,
    },
    {
      name: 'createAllBqLinks',
      meth: 'get',
      path: "/link/bq/all/create",
      fn: createAllBqLinks,
    },
  ]
};
const router = express.Router();
export default router;
export { data_stream_list_get };
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
apiInfo.list.forEach((api) => {
  router[api.meth](api.path, async (req, res, next) => {
    const result = await api.fn(api.args);
    // console.log('oblog', `api.result.${api.name}`, result);
    res.json({ result: result });
  });
});
// /gapi/ga/admin/
router.get('/', async(req, res, next) => {
  // res.send('ga admin api index');
  res.render('apiList', { title: 'adminApi', apiInfo: apiInfo });
});
router.get('/test', async (req, res, next) => {
  // const data=await getData('ppts');
  // res.json(data);
  saveJSON('tmp',{ts:Date.now()})
  res.json({test:Date.now()});
});
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
    saveJSON("cgtn_cdlist_short_",logResults);
    saveJSON("cgtn_cdlist_long_",results);
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
  const result = await cd_create(cfg_pid, cdObj);
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
    saveJSON("cgtn_short",logResults);
    saveJSON("cgtn_long",results);
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
    saveJSON("cgtn_cd_update_short",logResults);
    saveJSON("cgtn_cd_update_long",results);
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
    saveJSON("cgtn_drlist_short",logResults);
    saveJSON("cgtn_drlist_long",results);
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
    saveJSON("cgtn_dr_update_short",logResults);
    saveJSON("cgtn_dr_update_long",results);
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
    saveJSON("cgtn_signal-get_short",logResults);
    saveJSON("cgtn_signal-get_long",results);
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
  const result = await key_event_create("443397177");
  console.log('oblog_20241018', 'key_event_create', result);
  res.json(result);
});
router.get('/keyevt/create/batch', async (req, res, next) => {
  const promises = [];
  const pptArr=await getData('ppts');
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: key_event_create(pptId),
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
    saveJSON("cgtn_keyEvent_create_short",logResults);
    saveJSON("cgtn_keyEvent_create_long",results);
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
