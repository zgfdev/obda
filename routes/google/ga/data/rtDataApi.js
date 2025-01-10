import express from 'express';
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from 'fs';
import rtGA_dataApi_gd from './rtGD.js';
import { getRouter } from '#utils/obfn.js';
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const adc = new BetaAnalyticsDataClient({keyFilename: process.env.credential_gcp_service_account_json}); //GCP服务账号凭据文件
const propertyId=process.env.ga_property_id; // GA媒体资源ID

var dataRanges=[{startDate: '7daysAgo',endDate: 'yesterday'}];
dataRanges=[{startDate: 'yesterday',endDate: 'yesterday'}];
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
function timeoutPromise() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject("timeout 20s");
      }, 20000);
    });
}
function getReport(pid,drs,cds,cms,dft,mft){
    return Promise.race([
      adc.runReport({
          property: `properties/${pid||propertyId}`,
          dateRanges: drs||dataRanges,
          dimensions: cds||[{name: 'hostName',},],
          metrics: cms||[{name: 'screenPageViews',},{name: 'totalUsers',}],
          dimensionFilter: dft,
          metricFilter: mft,
          limit: 10000
      }), 
      timeoutPromise()
    ]);
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function getResult(pid,drs,cds,cms,dft,mft){
    const [result]=await getReport(pid,drs,cds,cms,dft,mft);
    fs.writeFile(`./data/born/temp_${Date.now()}.json`, JSON.stringify(result), function (err) {
        if (err) {
            return console.log('oblog','writeFile.err',err);
        };
    });
}
// getResult();
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// 特定网页路径的网页浏览量、用户数、互动总时长
function getData1(){
  getResult(
    propertyId,
    // [{startDate: '2024-01-12',endDate: '2024-01-12'}], //一天
    [{startDate: '2024-01-06',endDate: '2024-01-12'}], //一周
    [{name: 'pagePath',}],
    [{name: 'screenPageViews',},{name: 'totalUsers',},{name: 'userEngagementDuration',}],
    {
      "filter": {
        "fieldName": "pagePath",
        "stringFilter": {
          "matchType": "EXACT",
          "value": "/da/ga4/",  //页面路径
          "caseSensitive": false
        }
      }
    }
  );
}
// getData1();
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// 特定事件的事件数、用户数
function getData2(){
  getResult(
    propertyId,
    // [{startDate: '2024-01-12',endDate: '2024-01-12'}], //一天
    [{startDate: '2024-01-06',endDate: '2024-01-12'}], //一周
    [{name: 'eventName',}],
    [{name: 'screenPageViews',},{name: 'totalUsers',}],
    {
      "filter": {
        "fieldName": "eventName",
        "stringFilter": {
          "matchType": "EXACT",
          "value": "page_view",  //事件名称
          "caseSensitive": false
        }
      }
    }
  );
}
// getData2();
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const routes=[
  { name: 'index', type: 'index', path: '/', title: 'GA DataAPI', base: '/api/gapi/ga/data' },
    {
      name: 'GA dataApi GD', type: 'use', path: '/gd', fn: rtGA_dataApi_gd
    },
    {
      name: 'getReportResult',
      meth: 'get',
      path: '/report',
      fn: getReportResult
    },
];
const router = express.Router();
export default getRouter(routes);

async function getReportResult(req){
  try {
    var ro=req.body;
    let pid=ro?.pid, drs=ro?.drs, cds=ro?.cds, cms=ro?.cms, dft=ro?.dft, mft=ro?.mft;
    const [result]=await getReport(pid,drs,cds,cms,dft,mft);
    return {stauts:'ok',result:result};
  } catch (err) {
    console.log('oblog','getReport.err',err);
    return {status:"err"};
  }
}
