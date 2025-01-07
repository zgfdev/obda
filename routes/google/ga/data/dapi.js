// https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries

import express from 'express';

const router=express.Router();
const fnda = require('./fn_dataAPI.js');

// obAPI: {"method": "GET", "path":"/da/api", "des":"get GA report"}
router.get('/', function(req, res, next) {
    res.render('basic', { title: 'GA4: Data API' });
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// obAPI: {"method": "GET", "path":"/da/api/data/report", "des":"get GA Report"}
router.post("/report",async(req,res)=>{
  try {
    var ro=req.body;
    let pid=ro?.pid, drs=ro?.drs, cds=ro?.cds, cms=ro?.cms, dft=ro?.dft, mft=ro?.mft;
    const [result]=await fnda.getReport(pid,drs,cds,cms,dft,mft);
    return res.json({stauts:'ok',result:result});
  } catch (err) {
    console.log('oblog_20231011','getReport.err',err)
    res.json({status:"err"})
  }
});
// obAPI: {"method": "GET", "path":"/da/api/data/events", "des":"get GA Events"}
router.post("/events",async(req,res)=>{
  try {
    const [result]=await fnda.getEvents();
    return res.json({stauts:'ok',result:result});
  } catch (err) {
    res.json({status:"err",err:err})
  }
});
// obAPI: {"method": "GET", "path":"/da/api/data/users", "des":"get GA users"}
router.post("/users",async(req,res)=>{
  try {
    const [result]=await fnda.getUsers();
    return res.json({stauts:'ok',result:result});
  } catch (err) {
    console.log('oblog_20231011','getUsers.err',err)
    res.json({status:"err"})
  }
});
// obAPI: {"method": "GET", "path":"/da/api/data/users/active/bycity", "des":"getActiveUsersByCity"}
router.post("/users/active/bycity",async(req,res)=>{
  try {
    const [result]=await fnda.getActiveUsersByCity();
    return res.json({stauts:'ok',result:result});
  } catch (err) {
    res.json({status:"err",err:err})
  }
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/

router.post("/ads",(req,res)=>{
  runAdsReport().then(r=>{
    console.log('oblog_20230530','runAdsReport',r.length)
    return res.json({result:r});
  }).catch(e=>{
    return res.json({error:e});
  })
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
router.post("/cs",(req,res)=>{
  runCSReport().then(r=>{
    console.log('oblog_20230627','runCSReport',r.length)
    return res.json({result:r});
  }).catch(e=>{
    return res.json({error:e});
  })
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
// obAPI: {"method": "GET", "path":"/da/api/ga4/rt", "des":"get GA realtime report"}
router.post("/rt",(req,res)=>{
  getRTReport().then(r=>{
    console.log('oblog_20221018','getRTReport',r.length)
    return res.json({result:r});
  }).catch(e=>{
    return res.json({error:e});
  })
});

// obAPI: {"method": "GET", "path":"/da/api/rt", "des":"get GA coh0rt report"}
router.post("/co",(req,res)=>{
  var date=req.body.date;
  getCoReport(date).then(r=>{
    console.log('oblog_20221024','getCoReport',r.length)
    return res.json({result:r});
  });
});

router.post("/al",(req,res)=>{
  var date=req.body.date;
  getAudienceList(date)
  return res.json({result:'ok'});
});

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const propertyId = '278242794'; //_GA4TestProperty
// const propertyId = '270144721'; // AC GA4
// const propertyId = '300682144'; // c4
// const propertyId='276389518' //cups 276389518|276389776|370001830|370001838

// const authOptions={
//   keyFilename: "data/auth/xyzob-gapi-902cfc691a09.json"
// };
// const {BetaAnalyticsDataClient} = require('@google-analytics/data');
// const analyticsDataClient = new BetaAnalyticsDataClient(authOptions);


function runAdsReport() {
  return new Promise((resolve,reject)=>{
    try {
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: '2023-05-29',
            endDate: '2023-05-29',
          },
        ],
        dimensions: [
          {
            name: 'date',
          },
          // {
          //   name: 'sessionGoogleAdsCustomerId',
          // },
          // {
          //   name: 'sessionGoogleAdsCampaignName',
          // },
          // {
          //   name: 'sessionGoogleAdsCampaignId',
          // },
          // {
          //   name: 'sessionGoogleAdsCreativeId',
          // },
          {
            name: 'googleAdsCreativeId',
          },
          {
            name: 'googleAdsCustomerId',
          },
        ],
        metrics: [
          {
            name: 'advertiserAdImpressions',
          },
          {
            name: 'advertiserAdClicks'
          },
          {
            name: 'advertiserAdCost'
          },
          {
            name: 'sessions'
          },
          // {
          //   name: 'transactions'
          // },
          // {
          //   name: 'screenPageViews'
          // },
          {
            name: 'purchaseRevenue'
          },
          {
            name: 'engagedSessions'
          }
        ],
      }).then(res=>{
        resolve(res)
      }).catch(err=>{
        reject("err:"+err)
      })
    } catch (error) {
      reject("error:"+error)
    }
  })
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
function runCSReport() {
  return new Promise((resolve,reject)=>{
    try {
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: '2023-07-01',
            endDate: '2023-07-25',
          },
        ],
        dimensions: [
          {
            // name: 'city',
            name: "customEvent:site_id"
          },
        ],
        metrics: [
          {
            // name: 'activeUsers',
            name: 'screenPageViews',
          },
          {
            name: 'totalUsers'
          }
        ],
      }).then(res=>{
        resolve(res)
      }).catch(err=>{
        reject("err:"+err)
      })
    } catch (error) {
      reject("error:"+error)
    }
  })
}

async function runRTReport() {
  console.log('oblog_20221018','runRTReport',)
  const [response] = await analyticsDataClient.runRealtimeReport({
    property: `properties/${propertyId}`,
    dimensions: [
      {
        name: 'city',
      },
    ],
    metrics: [
      {
        name: 'activeUsers',
      },
    ],
  });

  console.log('Report result:');
  response.rows.forEach(row => {
    console.log(row.dimensionValues[0], row.metricValues[0]);
  });
  return []
}

function getRTReport(){
  return new Promise((resolve,reject)=>{
    try {
      analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [
          {
            // name: "customUser:Channel"
            name: "minutesAgo"
          }
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
        "metricAggregations": [
          "TOTAL"
        ],
        minuteRanges: [
          {
            startMinutesAgo: 10,
          }
        ],
      }).then(res=>{
        resolve(res)
      }).catch(err=>{
        reject("err:"+err)
      })
    } catch (error) {
      reject("error:"+error)
    }
  })
}

function getEvents(){
  return new Promise((resolve,reject)=>{
    try {
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: '2022-10-01',
            endDate: '2022-10-20',
          },
        ],
        dimensions: [
          {
            name: 'city',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      }).then(res=>{
        resolve(res)
      }).catch(err=>{
        reject("err:"+err)
      })
    } catch (error) {
      reject("error:"+error)
    }
  })
}

// dimension:date, cohortNthDay, firstUserSourceMedium; 
// Metrics: activeUsers,cohortActiveUsers,cohortTotalUsers
// cohort
function getCoReportBak(date){
  var date=date?date:"2022-10-01"
  var startDate=date;
  var endDate=date;
  return new Promise((resolve,reject)=>{
    try {
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        // "limit": 15,
        "dimensions": [{ "name": "cohort" },{'name': 'firstUserSource'}],
        // "dimensions": [{'name': 'firstUserSource'}, { "name": "cohort" }, { "name": "cohortNthDay" },{ "name": "date" },{
        //     name: 'firstUserSourceMedium',
        //   }],
        // "dimensionFilter": {
        //   "filter": {
        //     "fieldName": "eventName",
        //     "inListFilter": {
        //       "values": [ "fe9e2s" ]
        //     }
        //   }
        // },
        // "dimensionFilter": {
        //   "filter": {
        //     "fieldName": "date",
        //     "stringFilter": {
        //       "matchType": "EXACT",
        //       "values": "2022-10-01"
        //     }
        //   }
        // },
        "metrics": [{ "name": "activeUsers" },{ "name": "cohortTotalUsers" }],
        // { "name": "activeUsers" },{ "name": "cohortActiveUsers" },{ "name": "cohortTotalUsers" }
        "cohortSpec": {
          "cohorts": [
            {
              "dimension": "firstSessionDate",
              "dateRange": { "startDate": startDate, "endDate": endDate }
            }
          ],
          "cohortsRange": {
            // "start_offset": 0,
            "endOffset": 5,
            "granularity": "DAILY"
          }
        },
      }).then(res=>{
        resolve(res)
      }).catch(err=>{
        reject("err:"+err)
      })
    } catch (error) {
      reject("error:"+error)
    }
  })
}


function getCoReport(date){
  var date=date?date:"2022-10-27"
  var startDate=date;
  var endDate=date;
  return new Promise((resolve,reject)=>{
    try {
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        // "dimensions": [{ "name": "date" },{ "name": "cohortNthDay" },{'name': 'firstUserSource'},{ "name": "cohort" }],
        // "metrics": [{ "name": "activeUsers" },{ "name": "cohortActiveUsers" },{ "name": "cohortTotalUsers" }],
        // "cohortSpec": {
        //   "cohorts": [
        //     {
        //       "dimension": "firstSessionDate",
        //       "dateRange": { "startDate": "2022-10-01", "endDate": "2022-10-23" }
        //     }
        //   ],
        //   "cohortsRange": {
        //     "endOffset": 5,
        //     "granularity": "DAILY"
        //   }
        // },

        
          "dimensions": [
            { "name": "cohortNthDay" },
            { "name": "firstUserSource" },
            { "name": "cohort" }
          ],
          "dimensionFilter": {
            "filter": {
              "fieldName": "eventName",
              "stringFilter": {
                "matchType": "EXACT",
                "value": "fe9e2s",
                "caseSensitive": false
              }
            }
          },
          "metrics": [{ "name": "cohortActiveUsers" }],
          "cohortSpec": {
            "cohorts": [
              {
                "dimension": "firstSessionDate",
                "dateRange": {
                  "startDate": "2022-10-27",
                  "endDate": "2022-10-27"
                }
              }
            ],
            "cohortsRange": {
              "endOffset": 7,
              "granularity": "DAILY"
            }
          },
        
      }).then(res=>{
        resolve(res)
      }).catch(err=>{
        reject("err:"+err)
      })
    } catch (error) {
      reject("error:"+error)
    }
  })
}

/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/

async function getAudienceList(){
  const [response] = await analyticsDataClient.queryAudienceList({
    parent: `properties/${propertyId}`,
    // "parent": "properties/278242794",
  })
  console.log('getAudienceList:',response); 

}

// function main(name) {
//   const {AlphaAnalyticsDataClient} = require('@google-cloud/data').v1alpha;

//   // Instantiates a client
//   const dataClient = new AlphaAnalyticsDataClient();

//   async function callGetAudienceList() {
//     // Construct request
//     const request = {
//       name,
//     };

//     // Run request
//     const response = await dataClient.getAudienceList(request);
//     console.log(response);
//   }

//   callGetAudienceList();
// }

// process.on('unhandledRejection', err => {
//   console.error(err.message);
//   process.exitCode = 1;
// });
// main(...process.argv.slice(2));

export default router;