import express from 'express';

const router=express.Router();
export default router;

router.get('/', (req,res,next)=>{
    res.render('index', { title: `${process.env.APP_NAME.toUpperCase()}` });
});