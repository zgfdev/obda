import express from 'express';
import { cfg_aid, cfg_pid } from '#conf/obcfg.js';
import { saveJSON, getLocalJSON, getFirstHalf } from '#utils/obfn.js';


const router = express.Router();
export default router;


const apiInfo = {
  base: '/api/kit',
  list: [
    {
      name: 'getData',
      meth: 'get',
      path: '/data/get',
      fn: getPropertyJson
    },
    {
      name: 'diffData',
      meth: 'get',
      path: '/data/diff',
      fn: diffData
    },
    {
      name: 'getStreams',
      meth: 'get',
      path: '/data/streams',
      fn: getStreams
    },
    {
      name: 'getCds',
      meth: 'get',
      path: '/data/cds',
      fn: getCds
    }
  ],
};
router.get('/', (req, res, next) => {
  res.render('apiList', { title: `stream`, apiInfo: apiInfo });
});
apiInfo.list.forEach((api) => {
  router[api.meth](api.path, async (req, res, next) => {
    const result = await api.fn();
    // console.log('oblog', `api.result.${api.name}`, result);
    res.json({ result: result });
  });
});
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function getPropertyJson(){
  const data=await getLocalJSON('data/cgtn_properties.json');
  const arr=data.result.result[0];
  const pArr=[];
  arr.forEach(e=>{
    pArr.push(e.name.replace("properties/",""))
  })
  
  return pArr;
}

const arrA=["151417737","151883768","172297456","211255039","253160901","263239536","324226368","336873598","420328405","430626303","434750039","434998402","435744733","435726861","435805351","443427902","443434892","443472093","443473054","443451650","443411514","443442424","443476825","443468989","443397177","443428679","443466319","443470805","443471615","443466904","443476644","443471522","443468995","443473298","443472745","443468040","443473690","443473063","443465969","443467290","443467224","443468997","443471623","443469579","443471853","443469235","443466570","443468395","443465474","443466916","443466332","443472104","452522782","454490720","454756259","454742257","454726097","454755985","454745902","454752880","454736813","454725710","454741352","454760239","454771654","454722764","454729825","454727500","454744972","454753449","454743342","454761323","454747310","454722665","454722666","454740530","454742269","454750751","454771667","454733473","454734988","463377332","463376131"]
const arrB=["443473690","443468995","443468997","443467290","443467224","443468395","443471623","443471853","443469235","443469579","443465474","443466916","443472104","443466570","430626303","443472093","443434892","443451650","443473054","443427902","443442424","443476825","443466319","443428679","443471615","443470805","443468989","443397177","443411514","443471522","443466904","443476644","443472745","443468040","443473298","443465969","443473063","443466332","435805351","435744733","435726861","434750039","454745902","454490720","454752880","454742257","454741352","454726097","454760239","454725710","454755985","454736813","454771654","454722764","454744972","454761323","454729825","454756259","454753449","454727500","454743342","454722665","454750751","454722666","454740530","454747310","454734988","454742269","454733473","454771667"]

function diffAB(a,b){
  var au=[],bu=[];
  a.forEach(function(e){
      if(!b.includes(e)){au.push(e)}
  });
  b.forEach(function(e){
      if(!a.includes(e)){bu.push(e)}
  });
  console.log('a有b无:',au)
  console.log('b有a无:',bu)
  console.log(a.length,b.length,au.length,bu.length)
  return au;
}

async function diffData(){
  return diffAB(arrA,arrB)
}

async function getStreams(){
  const data=await getLocalJSON('data/cgtn_datastreams.json');
  const obj=data.result.result;
  // console.log('oblog_20241218','',obj)
  const sObj={}
  Object.keys(obj).forEach(async e=>{
    sObj[e]=obj[e][0][0].name;
  })
  return sObj;
}
/*-++-++++=-++---+-=-++++---=-++++--+=-++++-+-=--+-+++-=-++---++=-++-++++=-++-++-+*/
async function getCds(){
  const data=await getLocalJSON('data/xm_es_cds.json');
  const arr=data.result;
  const cdArr=[];
  arr.forEach(e=>{
    if(!["utm_channel","utm_content","utm_term","utm_type","abtest_group","abtest_group1","abtest_group2","sid","perf","perf1","perf2"].includes(e.parameterName)){
      cdArr.push({
        displayName: e.displayName,
        description: e.description,
        scope: e.scope,
        parameterName: e.parameterName,
      })
    }
  })
  return cdArr;
}