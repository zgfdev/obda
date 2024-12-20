const cfgType="dev";
const cfgObj={
  dev: {
    key: "xyz",
    aid: ["188317615"],
    pid: ["278242794"],
  },
  prd: {
    key: "prd",
    aid: [],
    pid: [],
  },
  tmp: {
    key: "tmp",
    aid: [],
    pid: [],
  },
  env: {
    key: "env",
    aid: [process.env.ga_account_id],
    pid: [process.env.ga_property_id],
  },
  zgf: {
    key: "zgf",
    aid: [],
    pid: [],
  },
  cgtn: {
    key: "cgtn",
    aid: ["89339688"],
    pid: ["443466570"],
  },
};
const curObj=cfgObj[cfgType];
const cfg_key=`data/auth/${process.env['key_'+curObj.key]}.json`;
const cfg_aid=curObj.aid.at(-1);
const cfg_pid=curObj.pid.at(-1);

export {
  cfg_key,
  cfg_aid,
  cfg_pid,
}