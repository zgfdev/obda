import express from 'express';
import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import fs from 'fs';
import Bottleneck from "bottleneck";
// import pLimit from 'p-limit';
// const limit = pLimit(10);//限制并发10个请求

const limiter = new Bottleneck({//每分钟150个请求
  maxConcurrent: 1,  // 每次只允许1个并发请求
  minTime: 400       // 每个请求间隔400毫秒（60,000 ms / 150 = 400ms）
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const aasc = new AnalyticsAdminServiceClient({ keyFilename: process.env.credential_gcp_service_account_json }); //GCP服务账号凭据文件
var propertyId = process.env.ga_property_id; // GA媒体资源ID
// propertyId = '278242794';
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/

const cgtnArr = [
  ['chatroom_name', 'chatroom_name', '聊天室话题名称聊天室话题名称'],
  ['comment_attachment', 'comment_attachment', '评论附件评论附件'],
  ['comment_id', 'comment_id', '评论ID评论ID'],
  ['duration', 'duration', '播放时长播放时长'],
  ['editor', 'editor', '编辑编辑'],
  ['event_action', 'event_action', '事件动作事件动作'],
  ['event_category', 'event_category', '事件类别事件类别'],
  ['event_label', 'event_label', '事件标签事件标签'],
  ['file_name', 'file_name', '文件名称文件名称'],
  ['id_info', 'id_info', '新闻ID（旧版）新闻ID（旧版）'],
  ['medium', 'medium', '媒介媒介'],
  ['news_headline', 'news_headline', '新闻标题新闻标题'],
  ['news_id', 'news_id', '新闻ID新闻ID'],
  ['page_title', 'page_title', '页面标题页面标题'],
  ['percent_scroll', 'percent_scroll', '滚动百分比滚动百分比'],
  ['post_attachment', 'post_attachment', '贴文附件贴文附件'],
  ['post_id', 'post_id', '贴文ID贴文ID'],
  ['post_keywords', 'post_keywords', '贴文关键词贴文关键词'],
  ['publish_date', 'publish_date', '发布日期发布日期'],
  ['search_keywords', 'dimension32', '站内搜索关键词站内搜索关键词'],
  ['source', 'source', '来源来源'],
  ['utm_campaign', 'campaign', 'utm广告系列utm广告系列'],
  ['utm_content', 'content', 'utm内容utm内容'],
  ['video_status', 'video_status', '视频状态（直播等）视频状态（直播等）'],
  ['video_type', 'video_type', '视频类型视频类型'],
];
const pptArr = [
  '463376131',
  '443473690',
  '443468995',
  '443468997',
  '443467290',
  '443467224',
  '443468395',
  '443471623',
  '443471853',
  '443469235',
  '443469579',
  '443465474',
  '443466916',
  '443472104',
  '443466570',
  '463377332',
  '430626303',
  '443472093',
  '443434892',
  '443451650',
  '443473054',
  '443427902',
  '443442424',
  '443476825',
  '443466319',
  '443428679',
  '443471615',
  '443470805',
  '443468989',
  '443397177',
  '443411514',
  '443471522',
  '443466904',
  '443476644',
  '443472745',
  '443468040',
  '443473298',
  '443465969',
  '443473063',
  '443466332',
  '435805351',
  '435744733',
  '435726861',
  '434750039',
];

// const cgtnArr=[
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

async function account_getList() {
  const [accounts] = await aasc.listAccounts();
  accounts.forEach((account) => {
    console.log(account);
  });
}

async function cd_getList(pid) {
  const arr = [];
  const iterable = aasc.listCustomDimensionsAsync({
    parent: `properties/${pid || propertyId}`,
  });
  for await (const response of iterable) {
    arr.push(response);
  }
  return arr;
}

const customDimensionObj = {
  name: 'string',
  parameterName: 'string',
  displayName: 'string',
  description: 'string',
  scope: 'string',
  disallowAdsPersonalization: true,
};
async function cd_create(pid, cdObj) {
  try {
    const response = await aasc.createCustomDimension({
      parent: `properties/${pid || propertyId}`,
      customDimension: cdObj,
    });
    return { status: 'ok', data: response };
  } catch (error) {
    // console.log('oblog_20241018','error',error)
    return { status: 'err', data: error.details };
  }
}
async function cd_update(pid, cdObj){
  try {
    const response = await aasc.updateCustomDimension({
      updateMask: {
        customDimension: "properties/463376131/customDimensions/9841731339",
        description: "事件动作"
      },
    });
    return { status: 'ok', data: response };
  } catch (error) {
    console.log('oblog_20241018','error',error)
  }
}

async function dataRention_get(pid){
  const response = await aasc.getDataRetentionSettings({
    name:  `properties/${pid || propertyId}/dataRetentionSettings`,
  });
  console.log('oblog_20241018','dataRention_get',response);
  return response;
}
async function dataRention_update(pid){
  const response = await aasc.updateDataRetentionSettings({
    dataRetentionSettings: {
      name:  `properties/${pid || propertyId}/dataRetentionSettings`,
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
    name:  `properties/${pid || propertyId}/googleSignalsSettings`,
  });
  console.log('oblog_20241018','signal_get',response);
  return response;
}
async function signal_update(pid){
  const response = await aasc.updateGoogleSignalsSettings({
    dataRetentionSettings: {
      name:  `properties/${pid || propertyId}/googleSignalsSettings`,
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
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/

function timeoutPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('timeout 20s');
    }, 20000);
  });
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router = express.Router();
// /gapi/ga/admin/
router.get('/', (req, res, next) => {
  res.send('ga admin api index');
});

router.get('/account/list', async (req, res, next) => {
  account_getList();
  res.send('ga admin api test');
});

router.get('/cd/list', async (req, res, next) => {
  const result = await cd_getList(propertyId);
  console.log('oblog_20241018', 'cd_list', result);
  res.json({ result: result });
});
router.get('/cd/list/batch', async (req, res, next) => {
  const promises = [];
  pptArr.forEach((pptId, pptIndex) => {
    promises.push({
      promise: cd_getList(pptId),
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
    writeFile("cgtn_cdlist_short",logResults);
    writeFile("cgtn_cdlist_long",results);
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
  const result = await cd_create(propertyId, cdObj);
  console.log('oblog_20241018', 'cd_create', result);
  res.json(result);
});

router.get('/cd/create/batch', async (req, res, next) => {
  res.json({results:[]});
  return;
  const promises = [];
  cgtnArr.forEach((cdo, cdoIndex) => {
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
            cdo: cgtnArr[cdoIndex],
            reason: result.reason,
        };
      } else if (result.status === 'fulfilled') {
        console.log(`创建第 ${pptIndex + 1} 个 property 的第 ${cdoIndex + 1} 个维度成功。`);
        return {
            status: 'success',
            pIndex: pptIndex,
            cIndex: cdoIndex,
            pid: pptArr[pptIndex],
            cdo: cgtnArr[cdoIndex],
        };
      }
    });
    writeFile("cgtn_short",logResults);
    writeFile("cgtn_long",results);
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
  const result = await cd_update(propertyId, cdObj);
  console.log('oblog_20241018', 'cd_update', result);
  res.json(result);
});

router.get('/dr/get', async (req, res, next) => {
  const result = await dataRention_get("463376131");
  console.log('oblog_20241018', 'dr_get', result);
  res.json(result);
});
router.get('/dr/get/batch', async (req, res, next) => {
  const promises = [];
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
    writeFile("cgtn_drlist_short",logResults);
    writeFile("cgtn_drlist_long",results);
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
    writeFile("cgtn_dr_update_short",logResults);
    writeFile("cgtn_dr_update_long",results);
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
    writeFile("cgtn_dr_update_short",logResults);
    writeFile("cgtn_dr_update_long",results);
    res.json(results);
  } catch (error) {
    console.error('batch update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


function writeFile(fileName,info) {
    fs.appendFile(`./data/born/${fileName}_result_1.json`, JSON.stringify(info)+'\n', function (err) {
        if (err) {
            return console.log('oblog','writeFile.err',err);
        };
    });
}


export default router;
