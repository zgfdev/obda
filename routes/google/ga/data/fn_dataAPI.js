import { BetaAnalyticsDataClient } from "@google-analytics/data";

const authObj=JSON.parse(process.env.authObj);
const authOptions={
  keyFilename: authObj.xyzob,
};
const adc = new BetaAnalyticsDataClient(authOptions);

// const propertyId="273026423"; //xm
const propertyId="278242794"; //_GA4TestProperty
const dataRanges=[{startDate: 'yesterday',endDate: 'yesterday'}];


function getReport(pid,drs,cds,cms,dft,mft){
  console.log("oblog_20231011", "getReport",...arguments);
  return Promise.race([
    adc.runReport({
        property: `properties/${pid||propertyId}`,
        dateRanges: drs||dataRanges,
        dimensions: cds||[{name: 'hostName',},],
        metrics: cms||[{name: 'screenPageViews',},],
        dimensionFilter: dft,
        metricFilter: mft,
        limit: 10000
    }), 
    timeoutPromise()
  ]);
}
function getEvents(pid,drs) {
  console.log("oblog_20231011", "getEvents");
  return Promise.race([
    adc.runReport({
        property: `properties/${pid||propertyId}`,
        dateRanges: drs||dataRanges,
        dimensions: [
          {name: 'hostName',},
        ],
        metrics: [
          {name: 'screenPageViews',},
        ],
    }), 
    timeoutPromise()
  ]);
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
function getUsers(pid,drs) {
    console.log("oblog_20231011", "getUsers");
    return Promise.race([
      adc.runReport({
          property: `properties/${pid||propertyId}`,
          dateRanges: drs||dataRanges,
          metrics: [
            {name: 'totalUsers',},
          ],
      }), 
      timeoutPromise()
   ]);   
}
function getActiveUsers(pid,drs) {
  console.log("oblog_20231011", "getUsers");
  return Promise.race([
    adc.runReport({
        property: `properties/${pid||propertyId}`,
        dateRanges: drs||dataRanges,
        metrics: [
          {name: 'activeUsers',},
        ],
    }), 
    timeoutPromise()
 ]);   
}
function getUsersByCity(pid,drs) {
  console.log('oblog_20221017','getActiveUsersByCity')
  return Promise.race([
      adc.runReport({
          property: `properties/${pid||propertyId}`,
          dateRanges: drs||dataRanges,
          dimensions: [
            {name: 'city',},
          ],
          metrics: [
            {name: 'totalUsers',},
          ],
      }),
      timeoutPromise()
  ])
}
function getActiveUsersByCity(pid,drs) {
    console.log('oblog_20221017','getActiveUsersByCity')
    return Promise.race([
        adc.runReport({
            property: `properties/${pid||propertyId}`,
            dateRanges: drs||dataRanges,
            dimensions: [
              {name: 'city',},
            ],
            metrics: [
              {name: 'activeUsers',},
            ],
        }),
        timeoutPromise()
    ])
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
function timeoutPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("请求超过20s");
    }, 20000);
  });
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
export default {
  getReport,
  getEvents,
  getUsers,
  getActiveUsers,
  getUsersByCity,
  getActiveUsersByCity,
};
