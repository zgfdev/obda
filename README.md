# obda

## how to run

### dependencies

[Node.js](https://nodejs.org)
[PM2](https://pm2.keymetrics.io/)
[pnpm](https://pnpm.io/)

### command

```shell
npm install                                 # 安装依赖（npm）
# pnpm install                                # 安装依赖（pnpm）
pm2 start ecosystem.config.cjs --env dev    # 启动应用（开发环境）
# pm2 start ecosystem.config.cjs --env prd    # 启动应用（生产环境）
pm2 log                                     # 查看日志
pm2 stop obda                               # 关闭应用
```

## about: Google Analytics Data API demo

- https://developers.google.com/analytics/devguides/reporting/data/v1
- https://developers.google.com/analytics/devguides/reporting/data/v1/rest
- https://googleapis.dev/nodejs/analytics-data/latest/index.html

## about: Google Analytics Admin API demo
- https://developers.google.com/analytics/devguides/config/admin/v1
- https://developers.google.com/analytics/devguides/config/admin/v1/rest
- https://googleapis.dev/nodejs/analytics-admin/latest/index.html
