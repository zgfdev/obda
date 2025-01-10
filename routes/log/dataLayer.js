import express from 'express';
import { patchLocalJSON, getLocalJSON, getFirstHalf } from '../../src/utils/obfn.js';


const router=express.Router();
router.get('/', async (req, res, next) => {
  console.log('oblog_20241113','/log/dl',)
  res.json({path:'/log/dl'});
});


router.post('/', async (req, res, next) => {
  console.log('oblog_20241113','/log/dl')
  patchLocalJSON('temp',req.body)
  res.json({path:'/log/dl',data:req.body});
});

export default router;