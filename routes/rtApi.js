import express from 'express';
import rtAuth from './auth/rtAuth.js'
import rtDev from './dev/rtDev.js';
import rtKit from './kit/rtKit.js';
import rtLog_dl from './log/dataLayer.js'
import rtGA_dataApi_gd from './google/ga/data/rtGD.js';
import rtGA_dataApi from './google/ga/dataApi.js';
import rtGA_adminApi_xm from './google/ga/admin/rtXM.js';
import rtGA_adminApi from './google/ga/adminApi.js';
import rtGCP_resmApi from './google/gcp/resmApi.js';


const router=express.Router();
export default router;

// const routes=[
//   {
//     name:'test',
//     meth:'get',
//     path:'/test',
//     fn:async (req,res,next)=>{
//       res.json({ message: 'test' })
//     }
//   }
// ]

const apiInfo={
  base: '/api',
  list: [
    {
      name: 'GA dataApi',
      meth: 'get',
      path: "/gapi/ga/data",
    },
    {
      name: 'GA adminApi',
      meth: 'get',
      path: "/gapi/ga/admin",
    },
    {
      name: 'GCP resmApi',
      meth: 'get',
      path: "/gapi/gcp/resm",
    },
  ]
};
router.get('/', (req,res,next)=>{
    res.render('apiList', { title: `API`, apiInfo: apiInfo });
});


router.use('/auth', rtAuth);
router.use('/dev', rtDev);
router.use('/kit', rtKit);
router.use('/log/dl', rtLog_dl);
router.use('/gapi/ga/data/gd', rtGA_dataApi_gd);
router.use('/gapi/ga/data', rtGA_dataApi);
router.use('/gapi/ga/admin/xm', rtGA_adminApi_xm);
router.use('/gapi/ga/admin', rtGA_adminApi);
router.use('/gapi/gcp/resm', rtGCP_resmApi);

