import express from 'express';
import rtAuth from './auth/rtAuth.js'
import dataApi from './google/ga/dataApi.js';
import rtStream from './google/ga/stream.js';
import adminApi from './google/ga/adminApi.js';
import resmApi from './google/gcp/resmApi.js';
import logDL from './log/dataLayer.js'
const router=express.Router();

router.get('/', (req,res,next)=>{
    // res.send(`${process.env.APP_NAME} home`)
    res.render('index', { title: `${process.env.APP_NAME}` });
});
router.get('/test', (req,res,next)=>{
    console.log('oblog_20241021','test','/test')
    res.json({ message: 'test' })
});

router.use('/auth', rtAuth);
router.use('/data-api', dataApi);
router.use('/gapi/ga/data', dataApi);
router.use('/gapi/ga/admin/stream', rtStream);
router.use('/gapi/ga/admin', adminApi);
router.use('/gapi/gcp/resm', resmApi);
router.use('/log/dl', logDL);

export default router;