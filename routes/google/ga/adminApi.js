import express from 'express';
import { AnalyticsAdminServiceClient } from "@google-analytics/admin";
import fs from 'fs';





/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router=express.Router();
router.get('/', (req,res,next)=>{
    res.send("ga admin api test");
});

export default router;