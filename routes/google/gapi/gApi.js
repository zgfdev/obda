import express from 'express';
// import { GoogleApis } from "googleapis";
import fs from 'fs';





/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router=express.Router();
router.get('/', (req,res,next)=>{
    res.send("google apis test");
});

export default router;