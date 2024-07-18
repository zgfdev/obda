import express from 'express';
import { BigQuery } from "@google-cloud/bigquery";
import fs from 'fs';





/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router=express.Router();
router.get('/', (req,res,next)=>{
    res.send("bigquery api test");
});

export default router;