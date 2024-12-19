import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { cfg_key } from '#conf/obcfg.js';

const aasc = new AnalyticsAdminServiceClient({ keyFilename: cfg_key }); //GCP服务账号凭据文件


export {
  aasc,
}