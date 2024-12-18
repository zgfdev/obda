import express from 'express';
const router = express.Router();

router.post('/login', function(req, res, next) {
  const rb=req.body;
  if(rb.username=="aten"&&rb.password=="aten#123"){
      res.json({
          status: "success",
          msg: "login success",
      });
  }else{
      res.json({
          status: "failed",
          msg: "login failed",
      });
  }
});

export default router;

