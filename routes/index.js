import express from 'express';
import dataApi from './google/ga/dataApi.js';
import adminApi from './google/ga/adminApi.js';
const router=express.Router();

router.get('/', (req,res,next)=>{
    res.send(`${process.env.APP_NAME} home`)
});

router.use('/data-api', dataApi);
router.use('/gapi/ga/data', dataApi);
router.use('/gapi/ga/admin', adminApi);

export default router;