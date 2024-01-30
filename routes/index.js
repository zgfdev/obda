import express from 'express';
import dataApiIndex from './dataApi.js';
const router=express.Router();

router.get('/', (req,res,next)=>{
    res.send(`${process.env.APP_NAME} home`)
});

router.use('/data-api', dataApiIndex);

export default router;