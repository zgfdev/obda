import express from 'express';
// import { GoogleAuth } from "google-auth-library";
import fs from 'fs';





/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
const router=express.Router();
router.get('/', (req,res,next)=>{
    res.send("google auth api test");
});

export default router;