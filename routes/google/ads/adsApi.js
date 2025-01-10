import express from 'express';
import { GoogleAdsApi } from "google-ads-api";
import fs from 'fs';


/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router=express.Router();
router.get('/', (req,res,next)=>{
    res.send("google ads api test");
});

export default router;