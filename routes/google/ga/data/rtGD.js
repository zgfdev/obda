import express from 'express';
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const router = express.Router();
export default router;

// const keyFilePath = 'data/auth/xyzob-gapi-902cfc691a09.json';
const keyFilePath="data/auth/tmdev-gapi-5e5d6153c967.json";
const adc = new BetaAnalyticsDataClient({ keyFilename: keyFilePath });

const g_aid = '188317615';
// const g_pid = '278242794';
const g_pid="327342527";
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const routes = [
  { name: 'index', type: 'index', path: '/', title:'GA DataAPI: GD', base: '/api/gapi/ga/data/gd' },
  { name: 'dev', fn: () => 'dev' },
  { name: 'users_get', fn: users_get },
];
routes.forEach((route) => {
  const rtType = route.type || 'get';
  const rtPath = route.path || ('/' + route.name.replace(/_/g, '/'));
  if (rtType == 'use') {
    router.use(rtPath, route.fn);
  } else if(rtType == 'index'){
    router.get('/', (req, res, next) => {
      res.render('route', { title: route.title, rtBase: route.base, routes: routes });
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
var dataRanges=[{startDate: '7daysAgo',endDate: 'yesterday'}];
dataRanges=[{startDate: '2024-12-01',endDate: '2025-12-31'}];
async function users_get(pid,drs,cds,cms,dft,mft) {
  cds=[{name: 'streamName',},{name: 'date',}];
  cms=[{name: 'totalUsers',},{name: 'activeUsers',},{name: 'newUsers',}];
  mft={
    "filter": {
      "fieldName": "streamName",
      "inListFilter": {
        "values": [ "PLS - Android", "PLS - iOS" ]
      }
    }
  };
  return await adc.runReport({
    property: `properties/${pid||g_pid}`,
    dateRanges: drs||dataRanges,
    dimensions: cds||[{name: 'hostName',},],
    metrics: cms||[{name: 'screenPageViews',},{name: 'totalUsers',}],
    // dimensionFilter: dft,
    // metricFilter: mft,
    limit: 10000
  });
}